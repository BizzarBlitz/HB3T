import type {PlacedBet} from "./betData"

const WAGER_THRESHOLD = 10_000 // var FINAL_BET_THRESHOLD in website source code, but I'm too lazy to extract it automatically so just hope it doesn't change

export default function (wager: number, placedBet?: PlacedBet) {
	if (placedBet) {
		return placedBet.wager > WAGER_THRESHOLD
	} else {
		return wager > WAGER_THRESHOLD
	}
}
