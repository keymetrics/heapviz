import * as React from "react";
import { Component, ComponentState } from "react";
import logo from "./logo.svg";
import "./App.pcss";
import store from "../../store";
import { connect } from "react-redux";
import Renderer from "../Renderer";
import StatsWindow from "../StatsWindow";
import SampleSelector from "../SampleSelector";
import HoverNode from "../HoverNode";
import CurrentNode from "../CurrentNode";
import Filters from "../Filters";
import Loader from "../Loader";
import Tutorial from "../Tutorial";
import JoyrideOutlet from "../JoyrideOutlet";
import { Redirect } from "react-router-dom";
import { Node } from "../../services/worker/heap-profile-parser";
import { FSA } from '../../../typings/fsa';
import { actions } from '../../services/modal/state';
import {actions as tutorialActions} from '../../services/tutorial/state';

const { modal: { showModal } } = actions;
const { tutorial: { startTutorial } } = tutorialActions;

interface AppProps {
  message: string;
  showMessage: boolean;
  computing: boolean;
  drawing: boolean;
  stats: any;
  hasFile: boolean;
  fetching: boolean;
  hoverNode: Node;
  currentNode: Node;
  nodesLength: number;
  showEdges: () => FSA;
  showRetainers: () => FSA;
  start: () => FSA;
}

export const App = ({
      hasFile,
      fetching,
      showMessage,
      computing,
      drawing,
      message,
      stats,
      nodesLength,
      hoverNode,
      currentNode,
      showEdges,
      showRetainers,
      start
    }:AppProps) => {
  return hasFile
      ? <div className="App">
        {/*Dumb conditional here because of timing issues with very fast renders meaning we can get SHOW_MESSAGE's from our worker after our render has completed and triggered HIDE_MESSAGE*/}
        <Loader
          visible={showMessage && fetching || computing || drawing}
          message={message}
        />

        {stats && stats.samples.length > 1 ? <SampleSelector /> : null}

        <div className="left-rail">
          {!computing
            ? <Filters />
            : null}

          {stats ? <StatsWindow stats={stats} length={nodesLength} /> : null}
        </div>

        <div className="main-window">
        {!computing
          ? <Renderer />
          : null}
          <div className="node-inspect-container">
            {hoverNode ? <HoverNode node={hoverNode} /> : null}
            {
            currentNode ?
              <CurrentNode
                node={currentNode}
                showEdges={showEdges}
                showRetainers={showRetainers}
              /> : null}
          </div>
        </div>

        <div className="right-rail">
            <Tutorial start={start}/>
            <div className="powered-by-container">
              <h2 className="powered-by">Powered by</h2>
              <h1 className="logo"></h1>
            </div>
        </div>
        <JoyrideOutlet />
      </div>
      : <Redirect to="/" />;
}

export default connect(
  ({
    samples: { stats },
    heap: { computing, hoverNode, currentNode, nodesLength },
    file: { hasFile, fetching },
    renderer: { drawing },
    messages: { showing: showMessage, message }
  }) => {
    return {
      hasFile: fetching || hasFile,
      fetching,
      message,
      hoverNode,
      currentNode,
      showMessage,
      stats,
      computing,
      drawing,
      nodesLength
    };
  },
  dispatch => {
    return {
      showEdges: () => dispatch(showModal('edges')),
      showRetainers: () => dispatch(showModal('retainers')),
      start: () => dispatch(startTutorial())
    }
  }
)(App);
