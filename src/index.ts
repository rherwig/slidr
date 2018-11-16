import './style.less';

import Slider from './slider';

export const init = ($element: HTMLElement) => {
    return new Slider($element, {
        visibleSlides: 2,
        step: 2,
        infinite: false,
    });
};
