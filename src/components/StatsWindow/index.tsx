import * as React from 'react';
import './StatsWindow.pcss';
import Stats from '../Stats';
import * as filesize from 'filesize';
import Tutorial from "../Tutorial";
import { actions } from '../../services/modal/state';
import {actions as tutorialActions} from '../../services/tutorial/state';
import { FSA } from '../../../typings/fsa';
const { tutorial: { startTutorial } } = tutorialActions;

interface StatsWindowProps {
    stats: any;
    length: number;
    start: () => FSA;
}

function getSizes(totals:any) {
    return Object.keys(totals).reduce((all:any, key) => {
        all[key] = filesize(totals[key])
        return all;
    }, {})
}

export const StatsWindow = ({ stats, length, start }: StatsWindowProps) => {
    const renderStats = Object.assign({
        ["Number of nodes"]: length,
        ["Number of samples"]: stats.samples.length
    }, getSizes(stats.totals));

    return (
        <div className="StatsWindow module">
            <h3>Profile stats</h3>
            <Stats stats={renderStats} />
            <div className="flexer"></div>
            <Tutorial start={start}/>
        </div>
    )
};

export default StatsWindow;