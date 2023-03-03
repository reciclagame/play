import items from './assets/js/items.js';

(function () {
  const itemsKeys = Object.keys(items);

  // control constants
  let CURRENT;
  let LEVEL = 0;
  let LIVES = 3;
  let CACHE_SLICE = 0;
  let timer;

  // settings
  const STORAGE_KEY = 'recicla-game';
  const CACHE = 5;
  let TIMEOUT = 10000;

  // GUI elements
  const $bins = document.getElementsByClassName('bin');
  const $start = document.getElementsByClassName('start');
  const $labels = document.getElementsByClassName('label')
  const $overlay = document.getElementsByClassName('overlay');
  const $gameOver = document.getElementById('game-over');
  const $lastLevel = document.getElementById('last-level');
  const $record = document.getElementById('record');
  const $level = document.getElementById('level');
  const $lives = document.getElementById('lives');
  const $timerBar = document.getElementById('timer-bar');
  const $itemImg = document.getElementById('item-img');
  const $itemLabel = document.getElementById('item-label');

  // sounds
  const soundCorrect = new Audio('./assets/sounds/correct.mp3');
  const soundRecord = new Audio('./assets/sounds/record.wav');
  const soundWrong = new Audio('./assets/sounds/wrong.mp3');

  // bin select handler
  const onSelect = id => {
    clearTimer();
    check(id) ? correct() : wrong();
    start()
  }

  // current type getter
  const currentType = () => items[CURRENT]?.[1]

  // check answer by type
  const check = type => currentType() === type;

  // correct answer handler
  const correct = () => {
    play(soundCorrect);
    $level.textContent = 'Nível: ' + (++LEVEL);

    // decreament timer
    TIMEOUT -= 200
  }

  // wrong answer handler
  const wrong = () => {
    play(soundWrong);
    $lives.textContent = --LIVES + ` chance${LIVES > 1 ? 's' : ''}`;
  }

  // set timer handler
  const setTimer = () => {
    $timerBar.getBoundingClientRect();
    $timerBar.style.transition = `transform ${TIMEOUT / 1000}s`
    $timerBar.style.transform = 'scaleX(0)'

    timer = setTimeout(function () {
      currentType() === 'especial' ? correct() : wrong();
      clearTimer();
      start();
    }, TIMEOUT);
  }

  // clear timer handler
  const clearTimer = () => {
    $timerBar.style.transform = 'scaleX(1)'
    $timerBar.style.transition = 'none'
    $timerBar.getBoundingClientRect();
    clearTimeout(timer)
  }

  // game over handler
  const gameOver = () => {
    $gameOver.classList.add('show');

    setLastLevel()
    setRecord()
    reset();
  }

  // reset game
  const reset = () => {
    clearTimer();

    LEVEL = 0;
    LIVES = 3;
    $level.textContent = 'Nível: ' + LEVEL;
    $lives.textContent = LIVES + ' chances';
  }

  // render handler
  const render = current => {
    $itemImg.src = `./assets/images/i-${current}.png`;
    $itemLabel.textContent = items[current][0];
  }

  // show current item
  const show = () => {
    // filter items by level
    const currentItems = itemsKeys.filter(i => items[i][2] <= LEVEL);

    // sort an item preventing repeat the last ones shown
    const picked = Math.floor(Math.random() * (currentItems.length - CACHE_SLICE));
    CACHE_SLICE = Math.min(CACHE_SLICE + 1, CACHE);

    // put the sorted item at the end of the list
    [CURRENT] = currentItems.splice(picked, 1);
    itemsKeys.splice(itemsKeys.indexOf(CURRENT), 1);
    itemsKeys.push(CURRENT);

    // render current item
    render(CURRENT);
  }

  // toggle bin labels visibility
  const toggleLabels = () => {
    [...$labels].forEach($label => toggle($label, LEVEL < 20));
  }

  // toggle current item label visibility
  const toggleItemLabel = () => toggle($itemLabel, LEVEL < 25);

  // shuffle bins
  const shuffle = () => {
    if (LEVEL < 10) return;

    const $binsW = document.getElementById('bins')
    for (let i = $bins.length; i >= 0;) {
      $binsW.appendChild($bins[Math.random() * i-- | 0]);
    }
  }

  // set last level
  const setLastLevel = () => $lastLevel.textContent = LEVEL;

  // get record
  const getRecord = () => +localStorage.getItem(STORAGE_KEY);

  // set record
  const setRecord = () => {
    const record = getRecord();

    // broken record: do nothing
    if (record >= LEVEL) return;

    play(soundRecord);

    localStorage.setItem(STORAGE_KEY, LEVEL);
    $record.textContent = getRecord();
  }

  // sound play handler
  const play = sound => {
    sound.currentTime = 0;
    sound.play();
  }

  // toggle element visibility
  const toggle = (element, show) => {
    element.style.display = show ? 'flex' : 'none';
  }

  // start recursively
  const start = () => {
    if (LIVES === 0) return gameOver();

    [...$overlay].forEach(overlay => overlay.classList.remove('show'));

    // level settings
    shuffle();
    toggleItemLabel();
    toggleLabels();

    setTimer();
    show();
  }

  // set max level
  $record.textContent = getRecord();

  // bind start buttons
  [...$start].forEach(button => button.addEventListener('click', start));

  // bind bins
  [...$bins].forEach(bin => bin.addEventListener('click', () => onSelect(bin.id)));
})()