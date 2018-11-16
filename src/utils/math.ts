/**
 * Calculates the index of a slide considering the boundaries provided
 * by the total amount of slides as well as the minimum index.
 *
 * This is used for preventing users from sliding past the last slide or before
 * the first slide, when the slider is not infinite.
 *
 * @param index
 * @param infinite
 * @param visibleSlides
 * @param totalSlides
 */
export const getBoundSlideIndex = (
    index: number,
    infinite: boolean,
    visibleSlides: number,
    totalSlides: number,
) => {
    if (infinite) {
        return index;
    }

    if (index < 0) {
        return 0;
    }

    return Math.min(index, totalSlides - visibleSlides);
};
