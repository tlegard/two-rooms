export const times = <T>(foo: (idx?: number) => T, len: number): T[] => {
  let list = new Array<T>(len);
  let index = 0;
  while (index < len) {
    list[index] = foo(index);
    index += 1;
  }

  return list;
};

export const shuffle = <T>(array: T[]): T[] => {
  let index = array.length;
  let temp: T;
  let rand: number;

  while (index) {
    rand = Math.floor(Math.random() * index--);
    temp = array[index];
    array[index] = array[rand];
    array[rand] = temp;
  }

  return array;
};
