// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reviver = (_key: string, value: any): any => {
  try {
    return JSON.parse(value, reviver);
  } catch {
    if(typeof value === 'string') {
      const semiValues = value.split(';');
      if(semiValues.length > 1) {
        return stringToObject(JSON.stringify(semiValues));
      }
      const commaValues = value.split(',');
      if(commaValues.length > 1) {
        return stringToObject(JSON.stringify(commaValues));
      }
    }
    const int = Number(value);
    if(isNaN(int)) {
      return value;
    }
    return int;
  }
};

const stringToObject = <T>(str: string): T => {
  const formatted = str.replace(/"{/g, '{').replace(/}"/g, '}').replace(/"\[/g, '[').replace(/\]"/g, ']').replace(/\\"/g, '"');
  return JSON.parse(formatted, reviver);
};

export default stringToObject;
