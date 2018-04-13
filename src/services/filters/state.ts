import { createActions } from 'redux-actions';
import { FSA } from '../../../typings/fsa';
import { Epic } from 'redux-observable';
import { Observable } from 'rxjs';
import { sendMessage } from '../messages/state';
import { SamplesState } from '../samples/state';

//Actions
export const UPDATE_FILTER = 'filters/UPDATE_FILTER';
export const SUBMIT_FILTERS = 'filters/SUBMIT_FILTERS';

//Reducer
export interface FilterState {
    retainedSize: number;
    selfSize: number;
    edgesCount: number;
    retainersCount: number;
    type: string;
    [key: string]: string|number;
}

let url = new URL(window.location.href)
let rets = Number(url.searchParams.get('rets'))
let selfs = Number(url.searchParams.get('sefs'))
console.log({rets})
export const initialFilters: FilterState = {
    retainedSize: rets || 1000000,
    selfSize: selfs || 100,
    edgesCount: 0,
    retainersCount: 0,
    type: 'all'
}

export default function reducer(state = initialFilters, action: FSA) {
    switch (action.type) {
        case UPDATE_FILTER:
            const { type, value } = action.payload;
            return {
                ...state,
                [type]: value
            };
        default:
            return state;
    }
}

//Action creators
interface UpdateFiltersPayload {
    type: string;
    value: string | number;
}

interface SubmitFiltersPayload {
    filters: FilterState,
    start: number,
    end: number,
    size: number
}
export const actions = createActions({
    filters: {
        UPDATE_FILTER: (p: UpdateFiltersPayload) => p,
        SUBMIT_FILTERS: [
            (p: SubmitFiltersPayload) => p,
            () => sendMessage('Applying filters')
        ]
    }
});