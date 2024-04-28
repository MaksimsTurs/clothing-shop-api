import { body } from "express-validator";

export const registrationValidator = [
  body('firstName',       'First name is empty or to long!').isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('secondName',      'Second name is empty or to long!').isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('email',           'E-Mail is not valid!').isEmpty({ ignore_whitespace: false }).isEmail(),
  body('password',        'Password is to short!').isLength({ min: 8 }),
  body('confirmPassword', 'Confirm password is to short!').isLength({ min: 8 })
]

export const loginValidator = [
  body('firstName',   'First name is empty or to long!').isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('secondName',  'Second name is empty or to long!').isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('email',       'E-Mail is not valid!').isEmpty({ ignore_whitespace: false }).isEmail(),
  body('password',    'Password is to short!').isLength({ min: 8 })
]