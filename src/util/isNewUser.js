export default function isNewUser(createdAt) {
  const registrateDate = new Date(createdAt).getTime()
  const currDate = new Date().getTime()

  return Math.round(((currDate - registrateDate) / 1000) / (60 * 60 * 24 * 7)) <= 7
}