// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		const targetLitm = target.parentNode;
		// Race track form field
		if (targetLitm.matches('.card.track')) {
			handleSelectTrack(targetLitm)
		}

		// Podracer form field
		if (targetLitm.matches('.card.podracer')) {
			handleSelectPodRacer(targetLitm)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {

	// Get player_id and track_id from the store
	const { player_id, track_id } = store;
	//console.log("track: " + track_id);
  //console.log("player: " + player_id);
   
	// invoke the API call to create the race, then save the result
	let race;
	try{
		race = await createRace(player_id, track_id);
	}catch (err){
		console.log("createRace await error: " + error);
	}
   //console.log("race: " + JSON.stringify(race));

	// render starting UI
	renderAt('#race', renderRaceStartView(track_id, player_id))
  // update the store with the race id
	store.race_id = race.ID-1 

	// The race has been created, now start the countdown
	// call the async function runCountdown
	try {
		await runCountdown();
	}
	catch(error) {
		console.log("runCountdown: " + error);
	}

	// call the async function startRace
  try {
	  startRace(store.race_id);
  }
  catch(error) {
		console.log("start race: " + error);
	}

	// call the async function runRace
	runRace(store.race_id);

}

async function runRace(raceID) {
	try {
	return new Promise(resolve => {
	  // use Javascript's built in setInterval method to get race info every 500ms
	  // if the race info status property is "in-progress", update the leaderboard by calling:
    //        renderAt('#leaderBoard', raceProgress(res.positions))
	  // if the race info status property is "finished", run the following:
    //        clearInterval(raceInterval) // to stop the interval from repeating
    //        renderAt('#race', resultsView(res.positions)) // to render the results view
    //        resolve(res) // resolve the promise

    	const raceInterval = setInterval(async () => {
			const raceInfo = await getRace(raceID);
			if (raceInfo.status === 'in-progress') {
				renderAt('#leaderBoard', raceProgress(raceInfo.positions))
			} else if (raceInfo.status === 'finished') {
				clearInterval(raceInterval) // to stop the interval from repeating
				renderAt('#race', resultsView(raceInfo.positions)) // to render the results view
				resolve(raceInfo) // resolve the promise
			}
		}, 500)
	})
	} catch(error) {
		console.log("runRace: " + error);
	}
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer

				// if the countdown is done, clear the interval, resolve the promise, and return
				if (!timer) {
					clearInterval(interval);
					resolve();
				}
			}, 1000)
		})
	} catch(error) {
		console.log("runCountdown: " + error);
	}
}

function handleSelectPodRacer(target) {
	// console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	store.player_id = target.id
  //console.log("player id: " + store.player_id);
}

function handleSelectTrack(target) {
	// console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store
	store.track_id = target.id;
  //console.log("track id: " + store.track_id);

}

function handleAccelerate() {
	// console.log("accelerate button clicked")
	// Invoke the API call to accelerate
  try {
	  accelerate(store.race_id);
  }
  catch(error) {
		console.log("handleAccelerate: " + error);
	}
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</h4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</h4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: Track ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === Number(store.player_id))
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// Make a fetch call (with error handling!) to each of the following API endpoints 

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
  .then(res=>res.json())
	.catch(err => console.log("Problem with getTrack request::", err))
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
  .then(res=>res.json())
	.catch(err => console.log("Problem with getRacers request::", err))
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
  .then(res=>res.json())
	.catch(err => console.log("Problem with getRace request::", err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),})
	.catch(err => console.log("Problem with startRace request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		...defaultFetchOpts(),
		method: 'POST',
		mode: 'cors',})
	.catch(err => console.log("Problem with accelerate request::", err))
}
