import { RangeProps } from './props';
interface ProcessedProps {
    multiple: boolean;
    rangeProps: Required<RangeProps>;
    dataProps: {
        [key: string]: string;
    };
    otherProps: {
        [key: string]: any;
    };
}
/**
 * Takes raw props where virtually all properties are optional and returns an
 * object ready for use by a component with default values supplied.
 */
export declare function processProps(props?: {
    [key: string]: any;
}, focussedKnob?: 0 | 1): ProcessedProps;
export {};
//# sourceMappingURL=process-props.d.ts.map