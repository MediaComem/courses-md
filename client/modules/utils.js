export function extend(target, ...sources) {

  sources.forEach(source => {
    if (!source) {
      return;
    }

    for (var property in source) {
      target[property] = source[property];
    }
  });

  return target;
}
