import * as React from 'react';
import { Component, DragEvent } from 'react';
import { connect } from 'react-redux';
import './FileUploadWindow.pcss';
import { RouteComponentProps } from 'react-router';
import { FSA } from '../../../typings/fsa';
import { actions } from '../../services/file/state';
import { Header } from '../Header';
import { resetCache } from '../../services/canvasCache';
import { actions as modalActions } from '../../services/modal/state';
import { actions as heapActions } from '../../services/heap/state';
import ThumbnailPanels from '../ThumbnailPanels';
import { push } from 'react-router-redux';

const { file: { fetchLocalFile, loadFile, fileLoaded, dragOver, dragOut } } = actions;
const { modal: { showModal } } = modalActions;
const { heap: { transferProfile } } = heapActions;

interface FileUploadWindowProps {
  onClick: (size: string) => FSA;
  onDragOver: (ev: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  showHelp: () => FSA;
  testBrowserSupport: () => FSA;
  loadRemoteFile: () => void;
  overrideCssProps: () => void;
  size: any;
  fetching: boolean;
  dragging: boolean;
}

export class FileUploadWindow extends React.Component<FileUploadWindowProps, {}> {
  componentDidMount() {
    resetCache();
    this.props.testBrowserSupport();
    this.props.overrideCssProps();
    this.props.loadRemoteFile();
  }

  render() {
    const { onClick, onDragOver, onDragEnd, onDrop, showHelp, fetching, dragging } = this.props;
    return (
      <div className="page">
        <Header />
        <div className={`file-upload-window ${dragging ? 'dragging' : ''}`} onDragOver={onDragOver} onDragLeave={onDragEnd} onDrop={onDrop}>
          <div className="instruction-text">
            <h3>
              Drag a heap snapshot or heap timeline here!
            </h3>
            <div>
              <a onClick={showHelp}>(How do I create a heap timeline or heap snapshot?)</a>
            </div>
            <div className="spacer">
              ~ or ~
            </div>
            <ThumbnailPanels click={onClick}/>
          </div>
        </div>
      </div>
    )
  }
}

function loadStaticFile(size: string) {
  switch (size) {
    case 'small':
      return fetchLocalFile('Heap-20161109T212710.heaptimeline');
    case 'medium':
      return fetchLocalFile('Heap-20170129T011211.heaptimeline');
    case 'large':
      return fetchLocalFile('Heap-20161110T224559.heaptimeline');
  }
}

export default connect(
  ({ file: { fetching, dragging }, renderer: { size } }) => { return { fetching, dragging, size } },
  null,
  (stateProps, dispatchProps: any) => {
    const { size } = stateProps;
    const { dispatch } = dispatchProps;
    return {
      ...stateProps,

      onClick: (size: string) => dispatch(loadStaticFile(size)),

      showHelp: () => dispatch(showModal('help')),

      onDragOver(ev: DragEvent<HTMLDivElement>) {
        ev.stopPropagation();
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
        dispatch(dragOver());
      },

      onDragEnd() { dispatch(dragOut()) },

      onDrop(ev: DragEvent<HTMLDivElement>) {
        ev.stopPropagation();
        ev.preventDefault();
        const fr = new FileReader();
        const file = ev.dataTransfer.files[0];
        dispatch(loadFile(file.name));
        fr.readAsArrayBuffer(file);
        fr.onloadend = () => {
          console.log(fr.result)
          dispatch(fileLoaded(fr.result))
          dispatch(transferProfile({
            heap: fr.result,
            width: size * 2
          }));
        };
      },

      loadRemoteFile() {
        let url = new URL(window.location.href)
        let file = url.searchParams.get('file')
        console.log({file})
        let access_token = url.searchParams.get('access_token')
        console.log({access_token})
        dispatch(loadFile('Heapdump Snapshot'));
        fetch(file + '?access_token=' + access_token)
        .then(res => res.arrayBuffer())
        .then(data => {
          console.log(data)
          dispatch(fileLoaded(data))
          dispatch(transferProfile({
            heap: data,
            width: size * 2
          }))
        })
        .catch(console.log)
      },

      overrideCssProps () {
        let url = new URL(window.location.href)
        console.log({url})
        const styles = document.documentElement.style
        console.log({styles})
        let props = {
          base: decodeURIComponent(url.searchParams.get('base')),
          contrast: decodeURIComponent(url.searchParams.get('contrast')),
          text: decodeURIComponent(url.searchParams.get('text'))
        }
        console.log(props)
        Object.entries(props).forEach(entry => {
          const key = entry[0]
          const value = entry[1]
          styles.setProperty(`--${key}`, value)
        })
      },

      testBrowserSupport() {
        let canvas;
        let ctx;
        let supported;

        try {
          canvas = document.createElement('canvas');
          ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        }
        catch (e) {
          ctx = false;
        }

        supported = ctx && (typeof (window as any).WebAssembly === 'object');
        canvas = ctx = undefined;
        if (!supported) return dispatch(showModal('unsupported'));
      }
    }
  }
)(FileUploadWindow);
