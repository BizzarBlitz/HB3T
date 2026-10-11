const betData = reactive({
	scheduledMatches: [] as Match[],
	placedBets: [] as PlacedBet[],
})
export default betData

export type Match = {
	id: string
	participants: Participant[]
}
export type Participant = {
	id: string
	name: string // Only for display purposes really
	pool: number
}

export type PlacedBet = {
	wager: number
	participantId: string
	participantName: string
	matchId: string
}

type PlacedBetData = {
	amount: number // Wager
	pick_label: string // e.g. "Sum Bubble Balls"
	pick_participant_id: string // e.g. "sum_bubble_balls"
	scheduled_match_id: string // UUID of match card
	id: string // UUID of the bet instance itself (for Retract Bet button purposes)
}[]

async function getPlacedBets(): Promise<PlacedBet[]> {
	return await fetch("https://api.hamsballbattles.com/my-open-bets", {
		credentials: "include",
	})
		.then((response) => response.json())
		.then((placedBetData: PlacedBetData) => {
			const placedBets: PlacedBet[] = []

			placedBetData.forEach((placedBet) => {
				placedBets.push({
					wager: placedBet.amount,
					participantId: placedBet.pick_participant_id,
					participantName: placedBet.pick_label,
					matchId: placedBet.scheduled_match_id,
				})
			})

			return placedBets
		})
}

type ScheduledMatchData = {
	id: string
	match_type: string
	boss_name: string
	participants: {
		id: string
		name: string
	}[]
	pool: Record<string, number>
	pool_bettors: Record<string, number>
}[]

async function getScheduledMatches() {
	return await fetch("https://api.hamsballbattles.com/scheduled-matches")
		.then((response) => response.json())
		.then((scheduledMatches: ScheduledMatchData) => {
			const matches: Match[] = []
			scheduledMatches.forEach((match) => {
				const participants: Participant[] = []
				match.participants.forEach((participant) => {
					participants.push({
						id: participant.id,
						name: participant.name,
						pool: match.pool[participant.id]!,
					})
				})

				if (match.match_type === "Boss Battle") {
					participants.push({
						id: "boss",
						name: match.boss_name,
						pool: match.pool.boss!,
					})
				}

				matches.push({
					id: match.id,
					participants: participants,
				})
			})
			return matches
		})
}

const loadedBetData = reactive({
	placedBets: false,
	scheduledMatches: false,
})

// Use customData to override any fields
export async function refreshBetData() {
	const placedBets = getPlacedBets().then((placedBets) => {
		betData.placedBets = placedBets
		loadedBetData.placedBets = true
		return placedBets
	})

	const scheduledMatches = getScheduledMatches().then((scheduledMatches) => {
		betData.scheduledMatches = scheduledMatches
		loadedBetData.scheduledMatches = true
		return scheduledMatches
	})

	return await Promise.allSettled([placedBets, scheduledMatches])
}

export function isBetDataLoaded() {
	return loadedBetData.placedBets && loadedBetData.scheduledMatches
}

export async function waitForBetDataLoad() {
	return await new Promise<void>((resolve) => {
		if (isBetDataLoaded()) {
			resolve()
		} else {
			const unwatch = watch(loadedBetData, () => {
				if (isBetDataLoaded()) {
					unwatch() // Stop watching after everything has been loaded
					resolve()
				}
			})
		}
	})
}

refreshBetData()
