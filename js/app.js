/* eslint-disable no-undef */
/**
 * Main Application Logic - Simplified Version
 * This file contains the main functionality for the Pokemon Card Flip App
 */
import { PokemonService } from './pokemon.js';

// DOM Elements
const cardGrid = document.getElementById('card-grid');
const loadingSpinner = document.getElementById('loading-spinner');

// Constants
const CARD_COUNT = 12;

// Application State
let cards = [];

// Debug flag - set to true to simulate slower loading
const DEBUG_SHOW_SPINNER = false;
const LOADING_DELAY = 4000; // 2 seconds delay

//handling card selection
let firstSelectedCard = null;
let secondSelectedCard = null;

//Flag to prevent interaction while processing
let isProcessingPair = false;

// state tracking
let matched = 0;
const TOTAL_PAIRS = 6;

/**
 * Initialize the application
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | MDN: async function}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event | MDN: DOMContentLoaded}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/classList | MDN: classList}
 */
async function initApp() {
  // Show loading spinner
  showLoading();

  // Hide the card grid initially
  cardGrid.classList.add('hidden');

  // Create card elements
  createCardElements();

  // Fetch initial Pokemon data
  await fetchAndAssignPokemon();

  // Set up event listeners
  setupEventListeners();

  // Hide loading spinner and show cards
  hideLoading();
  cardGrid.classList.remove('hidden');
}

/**
 * Create card elements in the grid
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement | MDN: createElement}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML | MDN: innerHTML}
 */
function createCardElements() {
  // Clear existing cards
  cardGrid.innerHTML = '';
  cards = [];

  // Create new cards
  for (let i = 0; i < CARD_COUNT; i++) {
    const card = createCardElement(i);
    cardGrid.appendChild(card);
    cards.push(card);
  }
}

/**
 * Create a single card element
 * @param {number} index - Card index
 * @returns {HTMLElement} Card element
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset | MDN: dataset}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild | MDN: appendChild}
 */
function createCardElement(index) {
  // Create card elements
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = index;

  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner';

  const cardFront = document.createElement('div');
  cardFront.className = 'card-front';

  const cardBack = document.createElement('div');
  cardBack.className = 'card-back';

  // Add Pokeball image to front
  const pokeballImg = document.createElement('img');
  pokeballImg.src = '/assets/pokeball.png';
  pokeballImg.alt = 'red and white Pokéball';
  pokeballImg.className = 'pokeball-img';
  cardFront.appendChild(pokeballImg);

  // Assemble card
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  return card;
}

/**
 * Fetch and assign Pokemon to cards
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch | MDN: try...catch}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise | MDN: Promise}
 */
async function fetchAndAssignPokemon() {
  try {
    // Fetch multiple random Pokemon
    const pokemonList = await PokemonService.fetchMultipleRandomPokemon(CARD_COUNT / 2);
    //CARD_COUND / 2 = 6 Create 6 instead of 12

    const copy = [...pokemonList]; // copying the original array

    const All = pokemonList.concat(copy); // merging

    // To shuffle pairs
    const ShufflePairs = ShuffleArray(All);

    // If debug flag is on, add artificial delay to show the spinner
    if (DEBUG_SHOW_SPINNER) {
      await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
    }

    // Assign Pokemon to cards
    for (let i = 0; i < CARD_COUNT; i++) {
      assignPokemonToCard(cards[i], ShufflePairs[i]);
    }
  } catch (error) {
    console.error('Error fetching and assigning Pokemon:', error);
  }
}

function ShuffleArray(array) {
  //copying main array
  const arraycopy = structuredClone(array);

  // shuffling with Fisher-yates algorytm
  for (let i = arraycopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arraycopy[i], arraycopy[j]] = [arraycopy[j], arraycopy[i]];
  }

  //returning
  return arraycopy;

}

/**
 * Assign a Pokemon to a card
 * @param {HTMLElement} card - Card element
 * @param {Object} pokemon - Pokemon data
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify | MDN: JSON.stringify}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector | MDN: querySelector}
 */
function assignPokemonToCard(card, pokemon) {
  if (!card || !pokemon) {
    return;
  }

  // Store Pokemon data in card dataset
  card.dataset.pokemon = JSON.stringify(pokemon);

  // Get card back element
  const cardBack = card.querySelector('.card-back');

  // Clear existing content
  cardBack.innerHTML = '';

  // Create Pokemon elements
  const pokemonImg = document.createElement('img');
  pokemonImg.src = pokemon.sprite;
  pokemonImg.alt = pokemon.name;
  pokemonImg.className = 'pokemon-img';

  const pokemonName = document.createElement('h2');
  pokemonName.textContent = pokemon.name;
  pokemonName.className = 'pokemon-name';

  const pokemonTypes = document.createElement('div');
  pokemonTypes.className = 'pokemon-types';

  // Add type badges
  pokemon.types.forEach(type => {
    const typeBadge = document.createElement('span');
    typeBadge.textContent = type;
    typeBadge.className = `type-badge ${type}`;
    pokemonTypes.appendChild(typeBadge);
  });

  // Create stats section
  const pokemonStats = document.createElement('div');
  pokemonStats.className = 'pokemon-stats';

  // Add height stat
  const heightStat = document.createElement('div');
  heightStat.className = 'stat';
  heightStat.innerHTML = `<span>Height</span><span class="stat-value">${pokemon.height}m</span>`;

  // Add weight stat
  const weightStat = document.createElement('div');
  weightStat.className = 'stat';
  weightStat.innerHTML = `<span>Weight</span><span class="stat-value">${pokemon.weight}kg</span>`;

  // Add abilities count
  const abilitiesStat = document.createElement('div');
  abilitiesStat.className = 'stat';
  abilitiesStat.innerHTML = '<span>Abilities</span>' +
    `<span class="stat-value">${pokemon.abilities.length}</span>`;

  // Assemble stats
  pokemonStats.appendChild(heightStat);
  pokemonStats.appendChild(weightStat);
  pokemonStats.appendChild(abilitiesStat);

  // Assemble card back
  cardBack.appendChild(pokemonImg);
  cardBack.appendChild(pokemonName);
  cardBack.appendChild(pokemonTypes);
  cardBack.appendChild(pokemonStats);
}

/**
 * Handle card click
 * @param {Event} event - Click event
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event | MDN: Event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | MDN: classList}
 */
function handleCardClick(event) {
  // Find the clicked card
  let card = event.target;
  while (card && !card.classList.contains('card')) {
    card = card.parentElement;
  }

  if (!card) {
    return;
  }

  //pair porcessing
  if (card.classList.contains('flipped') || card.classList.contains('matched')) {
    return; // Already flipped or matched
  }

  if (isProcessingPair) {
    return;
  }

  // Toggle card flip
  card.classList.add('flipped');

  //Selection track logic
  if (!firstSelectedCard) {
    //selecting the first
    firstSelectedCard = card;
  } else {
    //selecting the second
    secondSelectedCard = card;
    isProcessingPair = true;

    //setting values
    const val1 = firstSelectedCard.dataset.pokemon;
    const val2 = secondSelectedCard.dataset.pokemon;

    if (val1 === val2) {
      // match found
      firstSelectedCard.classList.add('matched');
      secondSelectedCard.classList.add('matched');
      // increment matched pairs
      matched += 1;
      //check pairs completed
      checkGameCompletion();
      //reset selection
      resetSelection();
    } else {
      //no match, timeout 1s
      setTimeout(() => {
        firstSelectedCard.classList.remove('flipped');
        secondSelectedCard.classList.remove('flipped');
        resetSelection();
      }, 1000);
    }
  }
}

function resetSelection() {
  firstSelectedCard = null;
  secondSelectedCard = null;
  isProcessingPair = false;
}

function checkGameCompletion() {
  if (matched === TOTAL_PAIRS) {
    showGameComplete();
  }
}

function showGameComplete() {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('completion-message');

  messageContainer.innerHTML = `
  <h1>Congratulations Player</h1>
  <p> You found all Pokemon Pairs </p>
  <button id="play-again">Play Again </button>
  `;

  document.querySelector('.container').appendChild(messageContainer);

  //reset game
  document.getElementById('play-again').addEventListener('click', () => {
    messageContainer.remove();
    matched = 0;
    initApp(); //important to reset game.
  });
}
/**
 * Set up event listeners
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener | MDN: addEventListener}
 */
function setupEventListeners() {
  // Card click event
  cardGrid.addEventListener('click', handleCardClick);
}

/**
 * Show loading spinner
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | MDN: classList}
 */
function showLoading() {
  loadingSpinner.classList.remove('hidden');
}

/**
 * Hide loading spinner
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/classList | MDN: classList}
 */
function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
