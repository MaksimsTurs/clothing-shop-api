import Loger from "../../util/loger/loger.js"

export default async function getProductByTitle(req) {
  const timer = new Loger.create.Timer()
  const productProjection = { title: true, _id: true }

  let products

  try {
    timer.start('FINDING_PRODUCTS_BY_TITLE')
    products = await ProductModel.find({ stock: { $gte: 1 }, title: { $regex: req.params.title, $options: 'i' } }, productProjection)
    timer.stop('Complete finding product by title', 'FINDING_PRODUCTS_BY_TITLE')

    return { products }
  } catch(error) {
    throw new Error(error.message)
  }
}