namespace FakeDataUtils
{
	/**
	 * Returns a random integer between min (included) and max (excluded)
	 * Using Math.round() will give you a non-uniform distribution!
	 *
	 * @export
	 * @param {*} min
	 * @param {*} max
	 * @returns {number}
	 */
	export function getRandomInt(min, max): number
	{
		return Math.floor(Math.random() * (max - min)) + min;
	}
	
	export const getPlaceholditImgix = (
			width: number,
			height: number,
			fontSize: number,
			name: string
	) =>
	{
		return `https://placeholdit.imgix.net/~text?txtsize=${fontSize}&txt=${name}&w=${width}&h=${height}`;
	};
	
	export const getFakeImg = (
			width: number,
			height: number,
			fontSize: number,
			name: string
	) =>
	{
		return `https://fakeimg.pl/${width}x${height}/FFD890%2C128/000/?text=${name}&font_size=${fontSize}`;
	};
}

export default FakeDataUtils;
