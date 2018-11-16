import {IStore} from "../interfaces/IStore";
import {SliderState} from "../types/SliderState";

export default class Store implements IStore<SliderState> {

    private state: SliderState;
    private listener: (state: SliderState, prevState: SliderState) => void;

    constructor(initialState: SliderState) {
        this.state = initialState;
    }

    getState(): SliderState {
        return this.state;
    }

    listen(handler: (state: SliderState, prevState: SliderState) => void): void {
        this.listener = handler;
    }

    setState(callback: (prevState: SliderState) => {}): void {
        const prevState = {...this.state};
        const nextState = callback(prevState);

        this.state = {
            ...this.state,
            ...nextState,
        };

        this.listener && this.listener(this.state, prevState);
    }

    unlisten(): void {
        this.listener = null;
    }

}
