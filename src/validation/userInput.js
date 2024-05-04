import { body } from "express-validator";

export const registrationValidator = [
  body('firstName',       'First name is empty or to long!').isString().isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('secondName',      'Second name is empty or to long!').isString().isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('email',           'E-Mail is not valid!').isString().isEmpty({ ignore_whitespace: false }).isEmail(),
  body('password',        'Password is to short!').isString().isLength({ min: 8 }),
  body('confirmPassword', 'Confirm password is to short!').isString().isLength({ min: 8 })
]

export const loginValidator = [
  body('firstName',   'First name is empty or to long!').isString().isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('secondName',  'Second name is empty or to long!').isString().isEmpty({ ignore_whitespace: false }).isLength({ max: 20 }),
  body('email',       'E-Mail is not valid!').isString().isEmpty({ ignore_whitespace: false }).isEmail(),
  body('password',    'Password is to short!').isString().isLength({ min: 8 })
]

export const createOrderValidator = [
  body('checkID', 'Check id is empty!').isString().isEmpty({ ignore_whitespace: false }).isUUID(),
  body('adress', 'Adress is empty!').isString().isEmpty({ ignore_whitespace: false }),
  body('city', 'City is empty!').isString().isEmpty({ ignore_whitespace: false }),
  body('plz', 'PLZ is empty!').isNumeric({ no_symbols: true }).isEmpty({ ignore_whitespace: false })
]