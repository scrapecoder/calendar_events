export const TAG = '-calendar_event';

export const addTag = (name: string) => {
  return `${name}${TAG}`;
};

export const removeTag = (textWithTag: string) => {
  return textWithTag.replace(TAG, '');
};
