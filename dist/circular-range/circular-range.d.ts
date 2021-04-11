import React from 'react';
import { RangeProps } from '../shared';
import './circular-range.scss';
export type { SingleRangeProps, MultipleRangeProps, RangeMultipleChangeEvent } from '../shared';
interface ExclusiveCircularRangeProps {
    zeroAtDegrees?: number;
    counterClockwise?: boolean;
}
export declare type CircularRangeProps = RangeProps & ExclusiveCircularRangeProps;
export declare const CircularRange: React.FC<CircularRangeProps>;
//# sourceMappingURL=circular-range.d.ts.map