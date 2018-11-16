import { SliderOptions } from './types/SliderOptions';
import { SliderState } from './types/SliderState';
import { appendAll, cloneFirst, cloneLast, prependAll } from './utils/dom';
import Store from './utils/Store';
import { getBoundSlideIndex } from './utils/math';

const defaultOptions: SliderOptions = {
    visibleSlides: 1,
    step: 1,
    infinite: true,
};

class Slider {
    /**
     * Root element inside the DOM.
     * `div.sm-slider`
     */
    private readonly $ref: HTMLElement;

    /**
     * Element inside the root that contains the slides.
     * `div.slides`
     */
    private readonly $slidesContainer: HTMLElement;

    /**
     * NodeList containing the individual slides of the slider.
     * Duplicates created by the slider are no included here.
     */
    private readonly $slides: NodeListOf<HTMLElement>;

    /**
     * DOM element reference to the previous slide arrow.
     */
    private readonly $arrowPrev: HTMLElement;

    /**
     * DOM element reference to the next slide arrow.
     */
    private readonly $arrowNext: HTMLElement;

    /**
     * Slider options provided by the user. They are merged with the default
     * option, so all option parameters are optional.
     */
    private readonly options: SliderOptions;

    /**
     * Store that queries and mutates the slider state.
     * This is the single source of truth and contains all data required
     * to compute transforms, UI state and so on.
     */
    private readonly store: Store;

    /**
     * Constructor function
     *
     * Creates a new instance of the Slider class and sets up DOM along with
     * event listeners.
     *
     * @param $ref {HTMLElement} Root element of the slider
     * @param options {{}} Slider options
     */
    constructor($ref: HTMLElement, options: {} = {}) {
        this.$ref = $ref;
        this.$slidesContainer = this.$ref.querySelector('.slides');
        this.$slides = this.$slidesContainer.querySelectorAll('.slide');
        this.$arrowPrev = this.$ref.querySelector('.arrow-prev');
        this.$arrowNext = this.$ref.querySelector('.arrow-next');
        this.options = {
            ...defaultOptions,
            ...options,
        };

        this.store = this.createStore();
        this.setup();
    }

    /**
     * Initializes the store with the initial state of the slider
     * and returns it.
     * The state is created by querying the DOM and parsing the options,
     * provided by the user.
     */
    private createStore() {
        const { visibleSlides, infinite, step } = this.options;

        const totalSlides = this.$slides.length;
        const transform = 100 / visibleSlides;
        const transformOffset = infinite ? step + (totalSlides % step) : 0;
        const currentSlide = 0;
        const preventAnimation = false;
        const disablePrev = !infinite;
        const disableNext = visibleSlides >= totalSlides;

        const initialState: SliderState = {
            visibleSlides,
            transformOffset,
            transform,
            currentSlide,
            totalSlides,
            step,
            infinite,
            preventAnimation,
            disablePrev,
            disableNext,
        };

        const store = new Store(initialState);
        store.listen(this.onChange.bind(this));

        return store;
    }

    /**
     * Enhances the existing slider DOM with duplicated slides for infinite
     * sliding and attaches event listeners to the slider controls to make
     * it interactable.
     */
    private setup() {
        const {
            transform,
            step,
            visibleSlides,
            totalSlides,
            infinite,
            disablePrev,
            disableNext,
        } = this.store.getState();

        Array.prototype.forEach.call(this.$slides, ($slide: HTMLElement) => {
            $slide.style.flexBasis = `${transform}%`;
        });

        if (this.$arrowPrev) {
            this.$arrowPrev.addEventListener('click',
                this.prev.bind(this),
            );

            if (disablePrev) {
                this.$arrowPrev.classList.add('arrow-hidden');
            }
        }

        if (this.$arrowNext) {
            this.$arrowNext.addEventListener('click',
                this.next.bind(this),
            );

            if (disableNext) {
                this.$arrowNext.classList.add('arrow-hidden');
            }
        }

        if (infinite) {
            const $append = cloneFirst(this.$slides, visibleSlides + (totalSlides % step));
            appendAll($append, this.$slidesContainer);

            const $prepend = cloneLast(this.$slides, step + (totalSlides % step));
            prependAll($prepend, this.$slidesContainer);
        }

        this.slideTo(0, false);
    }

    /**
     * Slides to a specific slide, determined by its index (starting at 0).
     *
     * @param index Index of the target slide
     * @param preventAnimation True, if the sliding should occur without a css transiotion
     * @param done Function that is called, once the sliding transition has finished
     *
     * @public
     */
    public slideTo(index: number, preventAnimation: boolean = true, done?: Function) {
        const { transformOffset, transform } = this.store.getState();
        const nextTransform = -(transform * (index + transformOffset));

        if (!preventAnimation) {
            this.$slidesContainer.classList.add('is-animated');
            this.$slidesContainer.addEventListener('transitionend', () => {
                this.$slidesContainer.classList.remove('is-animated');
                done && done();
            }, { once: true });
        }

        this.$slidesContainer.style.transform = `translateX(${nextTransform}%)`;
    }

    /**
     * Slides to the previous slide.
     *
     * @public
     */
    public prev() {
        const {
            step,
            infinite,
            visibleSlides,
            totalSlides,
            disablePrev,
        } = this.store.getState();

        if (disablePrev) {
            return;
        }

        this.store.setState(prevState => {
            const nextIndex = prevState.currentSlide - step;
            const currentSlide = getBoundSlideIndex(
                nextIndex,
                infinite,
                visibleSlides,
                totalSlides,
            );

            return {
                currentSlide,
                preventAnimation: false,
            };
        });
    }

    /**
     * Slides to the next slides.
     *
     * @public
     */
    public next() {
        const {
            step,
            infinite,
            visibleSlides,
            totalSlides,
            disableNext,
        } = this.store.getState();

        if (disableNext) {
            return;
        }

        this.store.setState(prevState => {
            const nextIndex = prevState.currentSlide + step;
            const currentSlide = getBoundSlideIndex(
                nextIndex,
                infinite,
                visibleSlides,
                totalSlides,
            );

            console.log(currentSlide);

            return {
                currentSlide,
                preventAnimation: false,
            };
        });
    }

    /**
     * This method listens to state changes and makes the slider act accordingly.
     * All changes made to the slider DOM have to be implemented here, since
     * the state is the single source of truth.
     * All other methods are not allowed to mutate the DOM and should only
     * make changes to the state.
     *
     * @param state Current application state (after the change)
     * @param prevState Previous application state (before the change)
     */
    private onChange(state: SliderState, prevState: SliderState) {
        const {
            currentSlide,
            visibleSlides,
            totalSlides,
            preventAnimation,
            step,
            infinite,
            disablePrev,
            disableNext,
        } = state;

        if (currentSlide !== prevState.currentSlide) {
            this.slideTo(currentSlide, preventAnimation, () => {
                if (!infinite) {
                    return;
                }

                if (currentSlide >= totalSlides) {
                    return this.store.setState(() => ({
                        currentSlide: currentSlide - totalSlides,
                        preventAnimation: true,
                    }));
                }

                if (currentSlide <= -step) {
                    return this.store.setState(() => ({
                        currentSlide: totalSlides - step,
                        preventAnimation: true,
                    }));
                }
            });

            if (!infinite) {
                this.store.setState(() => ({
                    disablePrev: currentSlide === 0,
                    disableNext: currentSlide === totalSlides - visibleSlides,
                }));
            }
        }

        if (this.$arrowPrev && disablePrev !== prevState.disablePrev) {
            const method = disablePrev ? 'add' : 'remove';
            this.$arrowPrev.classList[ method ]('arrow-hidden');
        }

        if (this.$arrowNext && disableNext !== prevState.disableNext) {
            const method = disableNext ? 'add' : 'remove';
            this.$arrowNext.classList[ method ]('arrow-hidden');
        }
    }
}

export default Slider;
