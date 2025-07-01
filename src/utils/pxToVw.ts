// конвертация px в vw
export default (px: number, base?: number): string => {
    const windowWidth: number = typeof base === "number" ? base : window.innerWidth;

    return ((px / windowWidth) * 100).toFixed(2);
}