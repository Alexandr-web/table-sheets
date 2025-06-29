// конвертация px в vw
export default (px: number): string => {
    const windowWidth: number = window.innerWidth;

    return ((px / windowWidth) * 100).toFixed(2);
}