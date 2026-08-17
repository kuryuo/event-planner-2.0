import {forwardRef} from 'react';
import {Input as AntInput} from 'antd';
import type {GetProps, InputProps, InputRef} from 'antd';
import clsx from 'clsx';

type PasswordProps = GetProps<typeof AntInput.Password>;

const DEFAULT_CLASS = 'ep-input ep-input--m';

const InputInner = forwardRef<InputRef, InputProps>(function Input(
    {className, ...props},
    ref,
) {
    return <AntInput ref={ref} className={clsx(DEFAULT_CLASS, className)} {...props} />;
});

const Password = forwardRef<InputRef, PasswordProps>(function Password(
    {className, ...props},
    ref,
) {
    return (
        <AntInput.Password
            ref={ref}
            className={clsx(DEFAULT_CLASS, className)}
            {...props}
        />
    );
});

export const Input = Object.assign(InputInner, {
    Password,
    TextArea: AntInput.TextArea,
});
