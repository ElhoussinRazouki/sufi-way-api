import * as yup from 'yup';


export type RegisterDto = {
    username: string;
    email: string;
    password: string;
}
// write schema for the register dto and password at least 8 and have upper case and numbers at least
export const RegisterSchema = yup.object().shape({
    username: yup.string().required("username is required"),
    email: yup.string().required("email is required").email("must be a valid email"),
    password: yup.string().required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number'),

});