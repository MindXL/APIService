export const ddnetEncode = (str: string): string =>
    encodeURIComponent(
        str
            .replace(/ /g, '-32-')
            .replace(/\-/g, '-45-')
            .replace(/\\/g, '-92-')
            .replace(/\%/g, '-37-')
            .replace(/\?/g, '-63-')
            .replace(/\&/g, '-38-')
            .replace(/\=/g, '-61-')
            .replace(/\//g, '-47-')
    );

export const parseRaceTime = (time: string): number => {
    if (!time) return NaN;

    let result = 0;
    time.split('.')[0]
        .split(':')
        .reverse()
        .map((str, index) => {
            result += parseInt(str) * 60 ** index;
        });
    return result;
};
