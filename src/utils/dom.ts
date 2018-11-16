export const prependAll = (
    $elements: HTMLElement[],
    $root: HTMLElement
) => {
    Array.prototype.forEach.call($elements, ($element: HTMLElement) => {
        $root.insertBefore($element, $root.firstChild);
    });
};

export const appendAll = (
    $elements: HTMLElement[],
    $root: HTMLElement
) => {
    Array.prototype.forEach.call($elements, ($element: HTMLElement) => {
        $root.appendChild($element);
    });
};

const clone = ($element: HTMLElement) => {
    const $clone = $element.cloneNode(true) as HTMLElement;
    $clone.setAttribute('data-clone', 'true');

    return $clone;
};

export const cloneLast = ($elements: NodeListOf<HTMLElement>, n: number): HTMLElement[] => {
    const $result: HTMLElement[] = [];

    for (let i = $elements.length - 1, remaining = n; n > 0; i--, remaining--) {
        if (remaining === 0) {
            break;
        }

        $result.push(clone($elements[i]));
    }

    return $result;
};

export const cloneFirst = ($elements: NodeListOf<HTMLElement>, n: number): HTMLElement[] => {
    const $result: HTMLElement[] = [];

    for (let i = 0; i < n; i++) {
        $result.push(clone($elements[i]));
    }

    return $result;
};
