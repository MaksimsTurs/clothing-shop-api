export default function recursiveHiddeProperty(response, redicateKeys) {
  if(redicateKeys) for(let index = 0; index < redicateKeys.length; index++) response[redicateKeys[index]] = '[Hidden]'
}