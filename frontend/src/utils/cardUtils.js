// parsedDescription: "Provides support groups and classes for those with mental health challenges and for family\nmembers or loved ones. Also provides help finding and applying for resources. All programs\nare free and offered by people of similar lived experience. \n\nIn-person services suspended; virtual (on-line) support group; website lists days and times of support group meetings";


const trueLineBreak = `\n\n`

export const formatDescription = (str) => {
  let paragraphs = str.split(trueLineBreak);
  paragraphs = paragraphs.map(paragraph => paragraph.split('\n').join(''));
  return paragraphs.join(`\n\n`)
}