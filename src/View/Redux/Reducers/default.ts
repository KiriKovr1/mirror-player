import {
    TyAction,
} from '../Actions/index';

export type TyPensionReducer = {}

const initialState: TyPensionReducer = {
}

export default (state: TyPensionReducer = initialState, action: TyAction) => {
    switch(action.type) {
        default:
            return {...state};
    }
}