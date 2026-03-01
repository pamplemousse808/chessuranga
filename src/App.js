import { useState, useEffect, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

// Shared deck with time costs
const SHARED_DECK = [
  // Tier 1
  { id: "RAHU", name: "Rahu", color: "#9333ea", radius: 3, tier: 1, cost: 7, description: "Pass through pieces for 2 moves", image: "/images/rahu.jpg" },
  { id: "KETU", name: "Ketu", color: "#f97316", radius: 3, tier: 1, cost: 8, description: "When captured: +12s you, -12s opponent", image: "/images/ketu.jpg" },
  { id: "SURYA", name: "Surya", color: "#fbbf24", radius: 2, tier: 1, cost: 8, description: "Can't be captured for 2 moves", image: "/images/surya.jpg" },
  // Tier 2
  { id: "CHANDRA", name: "Chandra", color: "#e5e7eb", radius: 2, tier: 2, cost: 10, description: "Place 1-2 clones on rank (2nd = +5s)", image: "/images/chandra.jpg" },
  { id: "GURU", name: "Guru", color: "#a855f7", radius: 2, tier: 2, cost: 9, description: "Resurrect your piece where it died", image: "/images/guru.jpg" },
  { id: "SHUKRA", name: "Shukra", color: "#ec4899", radius: 2, tier: 2, cost: 11, description: "Triple time on next 2 captures", image: "/images/shukra.jpg" },
  // Tier 3
  { id: "BUDHA", name: "Budha", color: "#3b82f6", radius: 1, tier: 3, cost: 10, description: "Two moves (not if first captures)", image: "/images/budha.jpg" },
  { id: "MANGALA", name: "Mangala", color: "#ef4444", radius: 1, tier: 3, cost: 12, description: "Capture any adjacent piece", image: "/images/mangala.jpg" },
  { id: "SHANI", name: "Shani", color: "#1f2937", radius: 1, tier: 3, cost: 14, description: "Freeze enemy piece for 2 turns", image: "/images/shani.jpg" }
];

function App() {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState("");
  const [whiteTime, setWhiteTime] = useState(100);
  const [blackTime, setBlackTime] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  // Game mode
  const [gameMode, setGameMode] = useState(null); // 'pvp' or 'asura'

  // Captured pieces
  const [whiteCaptured, setWhiteCaptured] = useState([]);
  const [blackCaptured, setBlackCaptured] = useState([]);
  const [captureHistory, setCaptureHistory] = useState([]);

  // Shared card system
  const [usedCards, setUsedCards] = useState([]);
  const [tier1Unlocked, setTier1Unlocked] = useState(false);
  const [tier2Unlocked, setTier2Unlocked] = useState(false);
  const [tier3Unlocked, setTier3Unlocked] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // Tile system
  const [activeTiles, setActiveTiles] = useState([]);

  // Power system
  const [poweredPieces, setPoweredPieces] = useState({});
  const [frozenPieces, setFrozenPieces] = useState({});

  // CHANDRA system
  const [chandraMode, setChandraMode] = useState(null);
  const [chandraPlacementMode, setChandraPlacementMode] = useState(null);

  // GURU system
  const [guruMode, setGuruMode] = useState(null);
  const [resurrectedPieces, setResurrectedPieces] = useState({});

  // SHANI system
  const [shaniMode, setShaniMode] = useState(null);

  // Activation mode toggle
  const [activationMode, setActivationMode] = useState(false);

  // Chaos mode tracking
  const [chaosModeShown, setChaosModeShown] = useState({ white: false, black: false });
  const [showChaosPopup, setShowChaosPopup] = useState(false);

  // ASURA MODE
  const [asuraLives, setAsuraLives] = useState({});
  // Format: { 'b_p_0': 3, 'b_n_0': 2, ... } - tracks remaining lives for each piece
  const [stockfish, setStockfish] = useState(null);
  const stockfishRef = useRef(null);
  const [waitingForBot, setWaitingForBot] = useState(false);

  // Bot initialization - Stockfish
  useEffect(() => {
    if (gameMode === 'asura' && gameStarted && !stockfishRef.current) {
      console.log("Initializing Stockfish via Blob...");

      fetch('https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js')
        .then(res => res.text())
        .then(text => {
          const blob = new Blob([text], { type: 'application/javascript' });
          const url = URL.createObjectURL(blob);
          const sf = new Worker(url);
          sf.postMessage('uci');
          sf.postMessage('setoption name Skill Level value 5');
          sf.postMessage('isready');
          stockfishRef.current = sf;
          setStockfish({ initialized: true });
        })
        .catch(err => {
          console.error("Stockfish failed to load:", err);
          // Fall back to random moves
          stockfishRef.current = { initialized: true, random: true };
          setStockfish({ initialized: true, random: true });
        });
    }
  }, [gameMode, gameStarted]);

  // Initialize Asura lives
  useEffect(() => {
    if (gameMode === 'asura' && gameStarted && Object.keys(asuraLives).length === 0) {
      const lives = {};
      // Pawns get 3 lives, knights/bishops get 2, rooks get 1, queen/king get 0 extra
      for (let i = 0; i < 8; i++) {
        lives[`b_p_${i}`] = 3;
      }
      lives['b_n_0'] = 2;
      lives['b_n_1'] = 2;
      lives['b_b_0'] = 2;
      lives['b_b_1'] = 2;
      lives['b_r_0'] = 1;
      lives['b_r_1'] = 1;
      lives['b_q_0'] = 0;
      lives['b_k_0'] = 0;

      setAsuraLives(lives);
    }
  }, [gameMode, gameStarted, asuraLives]);

  // Timer countdown
  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const timer = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            setWinner("black");
            return 0;
          }
          if (prev === 30 && !chaosModeShown.white) {
            setChaosModeShown({ ...chaosModeShown, white: true });
            setShowChaosPopup(true);
            setTimeout(() => setShowChaosPopup(false), 3000);
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setGameOver(true);
            setWinner("white");
            return 0;
          }
          if (prev === 30 && !chaosModeShown.black) {
            setChaosModeShown({ ...chaosModeShown, black: true });
            setShowChaosPopup(true);
            setTimeout(() => setShowChaosPopup(false), 3000);
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game, gameOver, gameStarted, chaosModeShown]);

  // Tile expiration & frozen piece countdown & CHANDRA expiration & GURU resurrection countdown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!gameStarted || moveCount === 0) return;

    const updatedTiles = activeTiles
      .map(tile => {
        const newTurns = tile.turnsRemaining - 0.5;
        const bothActivated = tile.whiteActivated && tile.blackActivated;
        return { ...tile, turnsRemaining: newTurns, expired: bothActivated || newTurns <= 0 };
      })
      .filter(tile => !tile.expired);

    setActiveTiles(updatedTiles);

    const updatedFrozen = {};
    Object.keys(frozenPieces).forEach(square => {
      const turnsLeft = frozenPieces[square].turnsLeft - 0.5;
      if (turnsLeft > 0) {
        updatedFrozen[square] = { turnsLeft };
      }
    });
    setFrozenPieces(updatedFrozen);

    if (chandraMode) {
      const newTurnsLeft = chandraMode.turnsLeft - 0.5;
      if (newTurnsLeft <= 0) {
        setChandraMode(null);
      } else {
        setChandraMode({ ...chandraMode, turnsLeft: newTurnsLeft });
      }
    }

    const updatedResurrected = {};
    Object.keys(resurrectedPieces).forEach(square => {
      const turnsLeft = resurrectedPieces[square].turnsLeft - 0.5;
      if (turnsLeft > 0) {
        updatedResurrected[square] = {
          ...resurrectedPieces[square],
          turnsLeft
        };
      }
    });
    setResurrectedPieces(updatedResurrected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveCount]);

  // Bot move trigger
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  useEffect(() => {
    if (gameMode === 'asura' &&
      gameStarted &&
      !gameOver &&
      game.turn() === 'b' &&
      !waitingForBot &&
      stockfish) {
      makeAsuraMove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, gameStarted, gameOver, gameMode, waitingForBot, stockfish]);

  function makeAsuraMove() {
    console.log("Asura's turn - Stockfish thinking...");
    setWaitingForBot(true);

    const sf = stockfishRef.current;
    if (!sf) {
      setWaitingForBot(false);
      return;
    }

    sf.onmessage = (event) => {
      const msg = event.data;
      console.log("Stockfish:", msg);

      if (msg.startsWith('bestmove')) {
        const parts = msg.split(' ');
        const move = parts[1];

        if (!move || move === '(none)') {
          setWaitingForBot(false);
          return;
        }

        const from = move.substring(0, 2);
        const to = move.substring(2, 4);
        const promotion = move.length > 4 ? move[4] : 'q';

        const newGame = new Chess(game.fen());
        const result = newGame.move({ from, to, promotion });

        if (result) {
          setGame(newGame);
          setMoveCount(prev => prev + 1);
          if (newGame.isCheckmate()) {
            setGameOver(true);
            setWinner('white');
          }
        }
        setWaitingForBot(false);
      }
    };

    sf.postMessage(`position fen ${game.fen()}`);
    sf.postMessage('go movetime 500'); // thinks for 500ms per move
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getPieceValue(piece) {
    const values = { 'p': 2, 'n': 4, 'b': 4, 'r': 6, 'q': 8 };
    return values[piece] || 0;
  }

  function getMaterialValue(piece) {
    const values = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
    return values[piece] || 0;
  }

  function calculateMaterialScore() {
    let whiteMaterial = 0;
    let blackMaterial = 0;
    whiteCaptured.forEach(piece => { whiteMaterial += getMaterialValue(piece); });
    blackCaptured.forEach(piece => { blackMaterial += getMaterialValue(piece); });
    return { white: whiteMaterial, black: blackMaterial };
  }

  function calculateFinalScore() {
    const material = calculateMaterialScore();
    let whiteScore = material.white;
    let blackScore = material.black;

    if (winner === "white") {
      whiteScore += game.isCheckmate() ? 10 : 5;
    } else if (winner === "black") {
      blackScore += game.isCheckmate() ? 10 : 5;
    }

    return { white: whiteScore, black: blackScore };
  }

  function addTime(player, seconds) {
    if (player === "w") {
      setWhiteTime((prev) => Math.min(prev + seconds, 100));
    } else {
      setBlackTime((prev) => Math.min(prev + seconds, 100));
    }
  }

  function subtractTime(player, seconds) {
    if (player === "w") {
      setWhiteTime((prev) => Math.max(prev - seconds, 0));
    } else {
      setBlackTime((prev) => Math.max(prev - seconds, 0));
    }
  }

  function getCardCost(card) {
    const currentTime = game.turn() === 'w' ? whiteTime : blackTime;
    const inFinalStretch = currentTime < 30;

    // Asura mode: cards are half price
    const asuraModeDiscount = gameMode === 'asura' ? 0.5 : 1;

    const baseCost = card.cost * asuraModeDiscount;
    return inFinalStretch ? Math.ceil(baseCost * 0.5) : Math.ceil(baseCost);
  }

  function checkTierUnlocks(capturedPiece) {
    if (capturedPiece === 'p' && !tier1Unlocked) {
      setTier1Unlocked(true);
    }
    if ((capturedPiece === 'n' || capturedPiece === 'b') && !tier2Unlocked) {
      setTier1Unlocked(true);
      setTier2Unlocked(true);
    }
    if ((capturedPiece === 'r' || capturedPiece === 'q') && !tier3Unlocked) {
      setTier1Unlocked(true);
      setTier2Unlocked(true);
      setTier3Unlocked(true);
    }
  }

  function getSquaresInRadius(centerSquare, radius) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const file = centerSquare[0];
    const rank = parseInt(centerSquare[1]);
    const fileIndex = files.indexOf(file);

    const squares = [];

    for (let f = fileIndex - radius; f <= fileIndex + radius; f++) {
      for (let r = rank - radius; r <= rank + radius; r++) {
        if (f >= 0 && f < 8 && r >= 1 && r <= 8) {
          squares.push(files[f] + r);
        }
      }
    }

    return squares;
  }

  function getPiecesInZones() {
    const piecesInZones = [];
    const currentTurn = game.turn();

    activeTiles.forEach(tile => {
      const squares = getSquaresInRadius(tile.square, tile.radius);
      squares.forEach(square => {
        const piece = game.get(square);
        if (piece && piece.color === currentTurn) {
          const playerColor = piece.color === 'w' ? 'white' : 'black';
          const alreadyActivated = (playerColor === 'white' && tile.whiteActivated) ||
            (playerColor === 'black' && tile.blackActivated);
          const alreadyPowered = poweredPieces[square];

          if (!alreadyActivated && !alreadyPowered) {
            piecesInZones.push({ square, tileId: tile.square, tileType: tile.type, color: piece.color });
          }
        }
      });
    });

    return piecesInZones;
  }

  function placeTile(square) {
    if (!selectedCard) return;

    const card = selectedCard;
    const cost = getCardCost(card);

    subtractTime(game.turn(), cost);

    const newTile = {
      square: square,
      type: card.id,
      name: card.name,
      color: card.color + "66",
      radius: card.radius,
      turnsRemaining: 3,
      whiteActivated: false,
      blackActivated: false,
      whiteActivatedPiece: null,
      blackActivatedPiece: null
    };

    setActiveTiles([...activeTiles, newTile]);
    setUsedCards([...usedCards, card.id]);
    setSelectedCard(null);
  }

  function activateTileForPiece(square) {
    const piece = game.get(square);
    if (!piece) return;

    const playerColor = piece.color === 'w' ? 'white' : 'black';

    let powerType = null;
    let tileSquare = null;
    const updatedTiles = activeTiles.map(tile => {
      const inRange = getSquaresInRadius(tile.square, tile.radius).includes(square);

      if (inRange) {
        if (playerColor === 'white' && !tile.whiteActivated) {
          powerType = tile.type;
          tileSquare = tile.square;
          return { ...tile, whiteActivated: true, whiteActivatedPiece: square };
        } else if (playerColor === 'black' && !tile.blackActivated) {
          powerType = tile.type;
          tileSquare = tile.square;
          return { ...tile, blackActivated: true, blackActivatedPiece: square };
        }
      }

      return tile;
    });

    setActiveTiles(updatedTiles);

    if (powerType) {
      if (powerType === "CHANDRA") {
        const rank = parseInt(square[1]);
        setChandraPlacementMode({
          square: square,
          piece: piece,
          rank: rank,
          mirages: []
        });
        setActivationMode(false);
        return;
      }

      if (powerType === "GURU") {
        const tileRadius = SHARED_DECK.find(c => c.id === "GURU").radius;
        const squaresInRange = getSquaresInRadius(tileSquare, tileRadius);

        const availableResurrections = captureHistory.filter(capture => {
          return capture.color === piece.color &&
            squaresInRange.includes(capture.square) &&
            !game.get(capture.square);
        });

        if (availableResurrections.length === 0) {
          alert("No pieces to resurrect in range!");
          setActivationMode(false);
          return;
        }

        setGuruMode({
          tileSquare: tileSquare,
          playerColor: piece.color,
          availableResurrections: availableResurrections
        });
        setActivationMode(false);
        return;
      }

      if (powerType === "SHANI") {
        const tileRadius = SHARED_DECK.find(c => c.id === "SHANI").radius;
        const squaresInRange = getSquaresInRadius(tileSquare, tileRadius);

        const enemyPieces = [];
        const enemyColor = piece.color === 'w' ? 'b' : 'w';

        squaresInRange.forEach(square => {
          const targetPiece = game.get(square);
          if (targetPiece && targetPiece.color === enemyColor && !frozenPieces[square]) {
            enemyPieces.push({ square, piece: targetPiece });
          }
        });

        if (enemyPieces.length === 0) {
          alert("No enemy pieces to freeze in range!");
          setActivationMode(false);
          return;
        }

        setShaniMode({
          tileSquare: tileSquare,
          playerColor: piece.color,
          enemyPieces: enemyPieces
        });
        setActivationMode(false);
        return;
      }

      const newPoweredPieces = { ...poweredPieces };

      let usesLeft = 1;
      if (powerType === "RAHU") usesLeft = 2;
      if (powerType === "SURYA") usesLeft = 2;
      if (powerType === "SHUKRA") usesLeft = 2;
      if (powerType === "MANGALA") usesLeft = 3;

      newPoweredPieces[square] = {
        power: powerType,
        usesLeft: usesLeft,
        color: piece.color
      };

      setPoweredPieces(newPoweredPieces);
    }

    setActivationMode(false);
  }

  function updateTileActivations(newGame) {
    const updatedTiles = activeTiles.map(tile => {
      if (tile.whiteActivatedPiece) {
        const piece = newGame.get(tile.whiteActivatedPiece);
        if (!piece || piece.color !== 'w') {
          return { ...tile, whiteActivatedPiece: null };
        }
      }
      if (tile.blackActivatedPiece) {
        const piece = newGame.get(tile.blackActivatedPiece);
        if (!piece || piece.color !== 'b') {
          return { ...tile, blackActivatedPiece: null };
        }
      }
      return tile;
    });

    setActiveTiles(updatedTiles);
  }

  function wouldGiveCheck(gameCopy, square) {
    const piece = gameCopy.get(square);
    if (!piece) return false;

    const enemyColor = piece.color === 'w' ? 'b' : 'w';
    let kingSquare = null;

    for (let file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      for (let rank = 1; rank <= 8; rank++) {
        const sq = file + rank;
        const p = gameCopy.get(sq);
        if (p && p.type === 'k' && p.color === enemyColor) {
          kingSquare = sq;
          break;
        }
      }
      if (kingSquare) break;
    }

    if (!kingSquare) return false;

    try {
      const testMove = gameCopy.move({ from: square, to: kingSquare });
      if (testMove) {
        gameCopy.undo();
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  function getPieceId(square, piece) {
    // Generate unique ID for tracking Asura piece lives
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const file = square[0];

    if (piece.type === 'p') {
      const fileIndex = files.indexOf(file);
      return `${piece.color}_p_${fileIndex}`;
    }

    // For other pieces, use position-based ID
    const isQueenside = files.indexOf(file) < 4;
    const index = isQueenside ? 0 : 1;
    return `${piece.color}_${piece.type}_${index}`;
  }

  function respawnAsuraPiece(pieceId, pieceType) {
    setTimeout(() => {
      setGame(prevGame => {
        const newGame = new Chess(prevGame.fen());

        const parts = pieceId.split('_');
        const type = parts[1];
        const index = parseInt(parts[2]);

        let startSquare = null;
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        // CRITICAL FIX: Pawns can't be on rank 8 or rank 1!
        if (type === 'p') {
          // Try rank 7 first, then rank 6 if occupied
          startSquare = files[index] + '7';
          if (newGame.get(startSquare)) {
            startSquare = files[index] + '6';
          }
        } else if (type === 'n') {
          startSquare = index === 0 ? 'b8' : 'g8';
        } else if (type === 'b') {
          startSquare = index === 0 ? 'c8' : 'f8';
        } else if (type === 'r') {
          startSquare = index === 0 ? 'a8' : 'h8';
        } else if (type === 'q') {
          startSquare = 'd8';
        } else if (type === 'k') {
          startSquare = 'e8';
        }

        // If starting square is occupied, find nearest empty square
        if (newGame.get(startSquare)) {
          // For pawns, try ranks 7, 6, 5
          if (type === 'p') {
            for (let rank of ['7', '6', '5']) {
              const sq = files[index] + rank;
              if (!newGame.get(sq)) {
                startSquare = sq;
                break;
              }
            }
          } else {
            // For other pieces, try back ranks
            for (let rank of ['8', '7', '6']) {
              for (let file of files) {
                const sq = file + rank;
                if (!newGame.get(sq)) {
                  startSquare = sq;
                  break;
                }
              }
              if (startSquare && !newGame.get(startSquare)) break;
            }
          }
        }

        // Only respawn if square is empty and it's white's turn
        if (startSquare && !newGame.get(startSquare) && newGame.turn() === 'w') {
          newGame.put({ type: pieceType, color: 'b' }, startSquare);
          console.log(`Respawned ${pieceType} at ${startSquare}`);
        } else {
          console.log(`Could not respawn ${pieceType} - no valid square found`);
        }

        return newGame;
      });
    }, 2000);
  }

  function handleMove(from, to, promotion = 'q') {
    try {
      if (resurrectedPieces[from]) {
        console.log("Resurrected piece can't move yet!");
        return null;
      }

      if (resurrectedPieces[to]) {
        console.log("Resurrected piece can't be captured yet!");
        return null;
      }

      if (chandraMode && chandraMode.mirages.includes(from)) {
        console.log("Blocked mirage move from", from);
        return null;
      }

      if (chandraMode && from === chandraMode.realSquare) {
        console.log("Real CHANDRA piece moving - removing mirages");
        const cleanGame = new Chess(game.fen());
        chandraMode.mirages.forEach(square => {
          const piece = cleanGame.get(square);
          if (piece) {
            console.log("Removing mirage from", square);
            cleanGame.remove(square);
          }
        });
        setGame(cleanGame);
        setChandraMode(null);

        const gameCopy = new Chess(cleanGame.fen());
        const piece = gameCopy.get(from);
        if (!piece) return null;

        const capturedPiece = gameCopy.get(to);

        const move = gameCopy.move({
          from: from,
          to: to,
          promotion: promotion,
        });

        if (!move) return null;

        if (capturedPiece) {
          let timeBonus = getPieceValue(capturedPiece.type);
          addTime(gameCopy.turn() === 'w' ? 'b' : 'w', timeBonus);

          if (gameCopy.turn() === 'w') {
            setBlackCaptured([...blackCaptured, capturedPiece.type]);
          } else {
            setWhiteCaptured([...whiteCaptured, capturedPiece.type]);
          }

          checkTierUnlocks(capturedPiece.type);
        }

        setGame(gameCopy);
        setMoveCount(prev => prev + 1);

        if (gameCopy.isCheckmate()) {
          setGameOver(true);
          setWinner(gameCopy.turn() === "w" ? "black" : "white");
        }

        return gameCopy;
      }

      if (chandraMode && game.get(to)) {
        const isMirage = chandraMode.mirages.includes(to);
        const isReal = to === chandraMode.realSquare;

        if (isMirage) {
          console.log("Captured mirage at", to);
          const gameCopy = new Chess(game.fen());

          chandraMode.mirages.forEach(square => {
            const piece = gameCopy.get(square);
            if (piece) {
              console.log("Removing mirage from", square);
              gameCopy.remove(square);
            }
          });

          const move = gameCopy.move({
            from: from,
            to: to,
            promotion: promotion
          });

          if (!move) return null;

          setChandraMode(null);
          setGame(gameCopy);
          updateTileActivations(gameCopy);
          setMoveCount(prev => prev + 1);

          if (gameCopy.isCheckmate()) {
            setGameOver(true);
            setWinner(gameCopy.turn() === "w" ? "black" : "white");
          }

          return gameCopy;
        } else if (isReal) {
          console.log("Captured real CHANDRA piece at", to);
          const cleanGame = new Chess(game.fen());
          chandraMode.mirages.forEach(square => {
            const piece = cleanGame.get(square);
            if (piece) {
              console.log("Removing mirage from", square);
              cleanGame.remove(square);
            }
          });
          setGame(cleanGame);
          setChandraMode(null);

          const gameCopy = new Chess(cleanGame.fen());
          const piece = gameCopy.get(from);
          if (!piece) return null;

          const capturedPiece = gameCopy.get(to);

          const move = gameCopy.move({
            from: from,
            to: to,
            promotion: promotion
          });

          if (!move) return null;

          if (capturedPiece) {
            let timeBonus = getPieceValue(capturedPiece.type);

            const capturedPieceHadKetu = poweredPieces[to]?.power === "KETU";

            const power = poweredPieces[from];
            if (power && power.power === "SHUKRA" && power.usesLeft > 0) {
              timeBonus *= 3;
            }

            const newPoweredPiecesCapture = {};
            Object.keys(poweredPieces).forEach(sq => {
              if (poweredPieces[sq] && poweredPieces[sq].power && sq !== to) {
                newPoweredPiecesCapture[sq] = poweredPieces[sq];
              }
            });
            setPoweredPieces(newPoweredPiecesCapture);

            if (capturedPieceHadKetu) {
              const ketuOwner = gameCopy.turn() === 'w' ? 'b' : 'w';
              addTime(ketuOwner, 12);
              subtractTime(gameCopy.turn() === 'w' ? 'w' : 'b', 12);
            } else {
              addTime(gameCopy.turn() === 'w' ? 'b' : 'w', timeBonus);
            }

            setCaptureHistory([...captureHistory, { piece: capturedPiece.type, square: to, color: capturedPiece.color }]);

            if (gameCopy.turn() === 'w') {
              setBlackCaptured([...blackCaptured, capturedPiece.type]);
            } else {
              setWhiteCaptured([...whiteCaptured, capturedPiece.type]);
            }

            checkTierUnlocks(capturedPiece.type);
          }

          setGame(gameCopy);
          setMoveCount(prev => prev + 1);

          if (gameCopy.isCheckmate()) {
            setGameOver(true);
            setWinner(gameCopy.turn() === "w" ? "black" : "white");
          }

          return gameCopy;
        }
      }

      const piece = game.get(from);
      if (!piece) return null;

      const capturedPiece = game.get(to);
      const power = poweredPieces[from];

      if (frozenPieces[from]) return null;

      if (capturedPiece && poweredPieces[to]?.power === "SURYA" && poweredPieces[to].usesLeft > 0) {
        return null;
      }

      let moveWasMade = false;
      let gameCopy = new Chess(game.fen());

      if (power && power.power === "RAHU" && power.usesLeft > 0) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const fromFile = files.indexOf(from[0]);
        const fromRank = parseInt(from[1]);
        const toFile = files.indexOf(to[0]);
        const toRank = parseInt(to[1]);

        let isValidPattern = false;

        if (piece.type === 'p') {
          const direction = piece.color === 'w' ? 1 : -1;
          const startRank = piece.color === 'w' ? 2 : 7;

          if (fromFile === toFile) {
            if (!capturedPiece) {
              if (toRank === fromRank + direction) isValidPattern = true;
              if (fromRank === startRank && toRank === fromRank + (2 * direction)) isValidPattern = true;
            }
          } else if (Math.abs(fromFile - toFile) === 1 && toRank === fromRank + direction && capturedPiece) {
            isValidPattern = true;
          }
        } else if (piece.type === 'n') {
          const fileDiff = Math.abs(toFile - fromFile);
          const rankDiff = Math.abs(toRank - fromRank);
          if ((fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2)) {
            isValidPattern = true;
          }
        } else if (piece.type === 'b') {
          if (Math.abs(toFile - fromFile) === Math.abs(toRank - fromRank)) {
            isValidPattern = true;
          }
        } else if (piece.type === 'r') {
          if (fromFile === toFile || fromRank === toRank) {
            isValidPattern = true;
          }
        } else if (piece.type === 'q') {
          if (Math.abs(toFile - fromFile) === Math.abs(toRank - fromRank) ||
            fromFile === toFile || fromRank === toRank) {
            isValidPattern = true;
          }
        } else if (piece.type === 'k') {
          if (Math.abs(toFile - fromFile) <= 1 && Math.abs(toRank - fromRank) <= 1) {
            isValidPattern = true;
          }
        }

        if (isValidPattern) {
          if (capturedPiece && capturedPiece.color === piece.color) {
            return null;
          }

          gameCopy.remove(from);
          if (capturedPiece) {
            gameCopy.remove(to);
          }
          gameCopy.put({ type: piece.type, color: piece.color }, to);

          const newFen = gameCopy.fen();
          const fenParts = newFen.split(' ');
          fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
          gameCopy.load(fenParts.join(' '));

          moveWasMade = true;
        }
      }

      if (!moveWasMade && power && power.power === "MANGALA" && power.usesLeft > 0) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const fromFile = files.indexOf(from[0]);
        const fromRank = parseInt(from[1]);
        const toFile = files.indexOf(to[0]);
        const toRank = parseInt(to[1]);

        const fileDiff = Math.abs(toFile - fromFile);
        const rankDiff = Math.abs(toRank - fromRank);

        if (fileDiff <= 1 && rankDiff <= 1 && capturedPiece && capturedPiece.color !== piece.color) {
          gameCopy.remove(from);
          gameCopy.remove(to);
          gameCopy.put({ type: piece.type, color: piece.color }, to);

          const newFen = gameCopy.fen();
          const fenParts = newFen.split(' ');
          fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
          gameCopy.load(fenParts.join(' '));

          moveWasMade = true;
        }
      }

      if (!moveWasMade) {
        const move = gameCopy.move({
          from: from,
          to: to,
          promotion: promotion,
        });

        if (!move) return null;
      }

      if (power && power.power === "BUDHA" && !capturedPiece && power.usesLeft === 1) {
        const currentFen = gameCopy.fen();
        const fenParts = currentFen.split(' ');
        fenParts[1] = fenParts[1] === 'w' ? 'b' : 'w';
        gameCopy.load(fenParts.join(' '));
      }

      // Handle captures
      if (capturedPiece) {
        let timeBonus = getPieceValue(capturedPiece.type);

        const capturedPieceHadKetu = poweredPieces[to]?.power === "KETU";

        if (power && power.power === "SHUKRA" && power.usesLeft > 0) {
          timeBonus *= 3;
        }

        const newPoweredPiecesCapture = {};
        Object.keys(poweredPieces).forEach(sq => {
          if (poweredPieces[sq] && poweredPieces[sq].power && sq !== to) {
            newPoweredPiecesCapture[sq] = poweredPieces[sq];
          }
        });
        setPoweredPieces(newPoweredPiecesCapture);

        if (capturedPieceHadKetu) {
          const ketuOwner = game.turn() === 'w' ? 'b' : 'w';
          addTime(ketuOwner, 12);
          subtractTime(game.turn(), 12);
        } else {
          addTime(game.turn(), timeBonus);
        }

        // ASURA MODE: Check if piece has lives remaining
        if (gameMode === 'asura' && capturedPiece.color === 'b') {
          const pieceId = getPieceId(to, capturedPiece);
          const livesRemaining = asuraLives[pieceId] || 0;

          if (livesRemaining > 0) {
            // Piece will respawn!
            setAsuraLives({
              ...asuraLives,
              [pieceId]: livesRemaining - 1
            });
            respawnAsuraPiece(pieceId, capturedPiece.type);
          }
        }

        setCaptureHistory([...captureHistory, { piece: capturedPiece.type, square: to, color: capturedPiece.color }]);

        if (game.turn() === 'w') {
          setWhiteCaptured([...whiteCaptured, capturedPiece.type]);
        } else {
          setBlackCaptured([...blackCaptured, capturedPiece.type]);
        }

        checkTierUnlocks(capturedPiece.type);
      }

      const newPoweredPieces = { ...poweredPieces };

      if (capturedPiece && newPoweredPieces[to]) {
        delete newPoweredPieces[to];
      }

      if (power) {
        delete newPoweredPieces[from];

        let newUsesLeft = power.usesLeft - 1;

        if (power.power === "BUDHA" && capturedPiece) {
          newUsesLeft = 0;
        }

        if (newUsesLeft > 0) {
          newPoweredPieces[to] = {
            ...power,
            usesLeft: newUsesLeft
          };
        }
      }

      const cleanedPoweredPieces = {};
      Object.keys(newPoweredPieces).forEach(sq => {
        if (newPoweredPieces[sq] && newPoweredPieces[sq].power) {
          cleanedPoweredPieces[sq] = newPoweredPieces[sq];
        }
      });
      setPoweredPieces(cleanedPoweredPieces);

      setGame(gameCopy);
      updateTileActivations(gameCopy);
      setMoveCount(prev => prev + 1);

      if (gameCopy.isCheckmate()) {
        setGameOver(true);
        setWinner(gameCopy.turn() === "w" ? "black" : "white");
      }

      return gameCopy;
    } catch (error) {
      console.error("Move error:", error);
      return null;
    }
  }

  function onSquareClick(square) {
    if (gameOver || !gameStarted) return;
    if (gameMode === 'asura' && game.turn() === 'b') return; // Don't allow manual moves during bot turn

    if (selectedCard) {
      placeTile(square);
      return;
    }

    if (guruMode) {
      const resurrection = guruMode.availableResurrections.find(r => r.square === square);
      if (resurrection) {
        const newGame = new Chess(game.fen());
        newGame.put({
          type: resurrection.piece,
          color: guruMode.playerColor
        }, square);
        setGame(newGame);

        setResurrectedPieces({
          ...resurrectedPieces,
          [square]: {
            turnsLeft: 2,
            resurrectedFrom: resurrection
          }
        });

        setCaptureHistory(captureHistory.filter(c =>
          !(c.square === square && c.piece === resurrection.piece && c.color === resurrection.color)
        ));

        setGuruMode(null);
      }
      return;
    }

    if (shaniMode) {
      const targetPiece = shaniMode.enemyPieces.find(p => p.square === square);
      if (targetPiece) {
        setFrozenPieces({
          ...frozenPieces,
          [square]: {
            turnsLeft: 4
          }
        });

        setShaniMode(null);
      }
      return;
    }

    if (chandraPlacementMode) {
      const clickedRank = parseInt(square[1]);

      if (clickedRank === chandraPlacementMode.rank) {
        const piece = game.get(square);

        if (chandraPlacementMode.piece.type === 'b') {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          const originalFile = files.indexOf(chandraPlacementMode.square[0]);
          const originalRank = parseInt(chandraPlacementMode.square[1]);
          const originalIsLight = (originalFile + originalRank) % 2 === 0;

          const clickedFile = files.indexOf(square[0]);
          const clickedIsLight = (clickedFile + clickedRank) % 2 === 0;

          if (originalIsLight !== clickedIsLight) {
            return;
          }
        }

        if (!piece || square === chandraPlacementMode.square) {
          if (square === chandraPlacementMode.square) {
            return;
          }

          if (chandraPlacementMode.mirages.includes(square)) {
            setChandraPlacementMode({
              ...chandraPlacementMode,
              mirages: chandraPlacementMode.mirages.filter(s => s !== square)
            });
          } else if (chandraPlacementMode.mirages.length < 2) {
            setChandraPlacementMode({
              ...chandraPlacementMode,
              mirages: [...chandraPlacementMode.mirages, square]
            });
          }
        }
      }
      return;
    }

    if (activationMode) {
      const piecesInZones = getPiecesInZones();
      const pieceInZone = piecesInZones.find(p => p.square === square);

      if (pieceInZone) {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          activateTileForPiece(square);
          return;
        }
      }
      return;
    }

    if (!moveFrom) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        // Don't allow selecting a frozen piece
        if (frozenPieces[square]) {
          return;
        }
        setMoveFrom(square);
      }
      return;
    }

    // if you tap another one of your own pieces, switch selection
    const tappedPiece = game.get(square);
    if (tappedPiece && tappedPiece.color === game.turn()) {
      // Don't allow selecting a frozen piece
      if (frozenPieces[square]) {
        return;
      }
      setMoveFrom(square);
      return;
    }

    const movingPiece = game.get(moveFrom);
    if (!movingPiece || movingPiece.color !== game.turn()) {
      setMoveFrom("");
      return;
    }

    const result = handleMove(moveFrom, square);

    if (result !== null) {
      setMoveFrom("");
    } else {
      // Move failed - clear selection so player isn't stuck
      setMoveFrom("");
    }
  }

  function onPieceDrop(sourceSquare, targetSquare) {
    if (gameOver || !gameStarted || selectedCard || activationMode || chandraPlacementMode || guruMode || shaniMode) return false;
    if (gameMode === 'asura' && game.turn() === 'b') return false;

    // Don't allow moving mirages or treat capturing a mirage as a real capture
    if (chandraMode) {
      if (chandraMode.mirages.includes(moveFrom)) {
        setMoveFrom("");
        return;
      }
      if (chandraMode.mirages.includes(square)) {
        // Reveal the mirage!
        const newGame = new Chess(game.fen());
        chandraMode.mirages.forEach(sq => newGame.remove(sq));
        setGame(newGame);
        setChandraMode(null);
        setMoveFrom("");
        return;
      }
    }

    handleMove(moveFrom, square);
    setMoveFrom("");

    const result = handleMove(sourceSquare, targetSquare);
    setMoveFrom("");
    return result !== null;
  }
  function confirmChandraPlacement() {
    if (!chandraPlacementMode || chandraPlacementMode.mirages.length === 0) return;

    const baseCost = 10;
    const extraCost = chandraPlacementMode.mirages.length === 2 ? 5 : 0;
    const totalCost = baseCost + extraCost;

    subtractTime(game.turn(), totalCost);

    const gameCopy = new Chess(game.fen());
    const wouldCheck = wouldGiveCheck(gameCopy, chandraPlacementMode.square);

    if (wouldCheck) {
      alert("CHANDRA cannot give check! Power auto-revealed.");
      setChandraPlacementMode(null);
      return;
    }

    const newGame = new Chess(game.fen());
    chandraPlacementMode.mirages.forEach(square => {
      newGame.put({
        type: chandraPlacementMode.piece.type,
        color: chandraPlacementMode.piece.color
      }, square);
    });

    setGame(newGame);

    setChandraMode({
      realSquare: chandraPlacementMode.square,
      piece: chandraPlacementMode.piece,
      mirages: chandraPlacementMode.mirages,
      turnsLeft: 4,
      color: chandraPlacementMode.piece.color
    });

    setChandraPlacementMode(null);
  }

  function cancelChandraPlacement() {
    setChandraPlacementMode(null);
  }

  function cancelGuruMode() {
    setGuruMode(null);
  }

  function startGame(mode) {
    setGameMode(mode);
    setGameStarted(true);
  }

  function resetGame() {
    setGame(new Chess());
    setWhiteTime(100);
    setBlackTime(100);
    setGameOver(false);
    setWinner(null);
    setGameStarted(false);
    setGameMode(null);
    setMoveFrom("");
    setActiveTiles([]);
    setMoveCount(0);
    setWhiteCaptured([]);
    setBlackCaptured([]);
    setCaptureHistory([]);
    setTier1Unlocked(false);
    setTier2Unlocked(false);
    setTier3Unlocked(false);
    setUsedCards([]);
    setSelectedCard(null);
    setChaosModeShown({ white: false, black: false });
    setPoweredPieces({});
    setFrozenPieces({});
    setActivationMode(false);
    setChandraMode(null);
    setChandraPlacementMode(null);
    setGuruMode(null);
    setResurrectedPieces({});
    setShaniMode(null);
    setAsuraLives({});
    setWaitingForBot(false);

    // Clean up Stockfish if it exists and has terminate method
    if (stockfishRef.current && typeof stockfishRef.current.terminate === 'function') {
      stockfishRef.current.terminate();
    }
    stockfishRef.current = null;
    setStockfish(null);
  }

  // Theme colors based on game mode
  const theme = {
    background: gameMode === 'asura' ? '#0a0a0a' : '#1a1a2e',
    darkSquare: gameMode === 'asura' ? '#8b0000' : '#4a5568',
    lightSquare: gameMode === 'asura' ? '#1a1a1a' : '#cbd5e0',
    accent: gameMode === 'asura' ? '#ff4444' : '#4ecca3',
    text: gameMode === 'asura' ? '#ff6b6b' : '#eee'
  };

  const customStyles = {};
  const piecesInZones = getPiecesInZones();

  activeTiles.forEach(tile => {
    const squares = getSquaresInRadius(tile.square, tile.radius);
    squares.forEach(square => {
      customStyles[square] = {
        backgroundColor: tile.color,
        boxShadow: square === tile.square ? `inset 0 0 20px ${tile.color}` : ""
      };
    });

    if (tile.whiteActivatedPiece) {
      customStyles[tile.whiteActivatedPiece] = {
        ...(customStyles[tile.whiteActivatedPiece] || {}),
        border: "3px solid #4ecca3",
        boxShadow: "inset 0 0 10px rgba(78, 204, 163, 0.8)"
      };
    }
    if (tile.blackActivatedPiece) {
      customStyles[tile.blackActivatedPiece] = {
        ...(customStyles[tile.blackActivatedPiece] || {}),
        border: "3px solid #4ecca3",
        boxShadow: "inset 0 0 10px rgba(78, 204, 163, 0.8)"
      };
    }
  });

  Object.keys(poweredPieces).forEach(square => {
    const power = poweredPieces[square];

    if (!power || !power.power) return;

    const card = SHARED_DECK.find(c => c && c.id === power.power);
    if (card) {
      customStyles[square] = {
        ...(customStyles[square] || {}),
        border: `4px solid ${card.color}`,
        boxShadow: `0 0 20px ${card.color}, inset 0 0 15px ${card.color}88`
      };
    }
  });

  Object.keys(frozenPieces).forEach(square => {
    customStyles[square] = {
      ...(customStyles[square] || {}),
      border: "4px solid #1f2937",
      backgroundColor: "rgba(31, 41, 55, 0.7)",
      boxShadow: "inset 0 0 20px rgba(31, 41, 55, 0.9)"
    };
  });

  Object.keys(resurrectedPieces).forEach(square => {
    customStyles[square] = {
      ...(customStyles[square] || {}),
      border: "4px solid #a855f7",
      boxShadow: "0 0 25px #a855f7, inset 0 0 20px rgba(168, 85, 247, 0.6)",
      animation: "resurrectPulse 2s infinite"
    };
  });

  if (guruMode) {
    guruMode.availableResurrections.forEach(resurrection => {
      customStyles[resurrection.square] = {
        ...(customStyles[resurrection.square] || {}),
        backgroundColor: "rgba(168, 85, 247, 0.4)",
        border: "3px dashed #a855f7",
        boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)",
        cursor: "pointer"
      };
    });
  }

  if (shaniMode) {
    shaniMode.enemyPieces.forEach(enemyPiece => {
      customStyles[enemyPiece.square] = {
        ...(customStyles[enemyPiece.square] || {}),
        backgroundColor: "rgba(31, 41, 55, 0.5)",
        border: "3px dashed #1f2937",
        boxShadow: "0 0 20px rgba(31, 41, 55, 0.8)",
        cursor: "pointer"
      };
    });
  }

  if (chandraPlacementMode) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    files.forEach(file => {
      const square = file + chandraPlacementMode.rank;
      if (!game.get(square) && square !== chandraPlacementMode.square) {
        customStyles[square] = {
          ...(customStyles[square] || {}),
          backgroundColor: "rgba(229, 231, 235, 0.3)",
          border: "2px dashed #e5e7eb"
        };
      }
    });

    chandraPlacementMode.mirages.forEach(mirageSquare => {
      customStyles[mirageSquare] = {
        ...(customStyles[mirageSquare] || {}),
        backgroundColor: "rgba(229, 231, 235, 0.6)",
        border: "3px solid #e5e7eb",
        boxShadow: "0 0 15px #e5e7eb"
      };
    });

    customStyles[chandraPlacementMode.square] = {
      ...(customStyles[chandraPlacementMode.square] || {}),
      border: "3px solid #ffd700",
      boxShadow: "0 0 20px #ffd700"
    };
  }

  if (chandraMode) {
    chandraMode.mirages.forEach(mirageSquare => {
      customStyles[mirageSquare] = {
        ...(customStyles[mirageSquare] || {}),
        boxShadow: "0 0 10px rgba(229, 231, 235, 0.6)"
      };
    });
  }

  if (activationMode) {
    piecesInZones.forEach(pieceInfo => {
      customStyles[pieceInfo.square] = {
        ...(customStyles[pieceInfo.square] || {}),
        border: "3px solid #ffd700",
        boxShadow: "0 0 15px #ffd700, inset 0 0 10px rgba(255, 215, 0, 0.3)",
        animation: "pulse 1.5s infinite"
      };
    });
  }

  if (moveFrom && !selectedCard) {
    customStyles[moveFrom] = {
      ...(customStyles[moveFrom] || {}),
      backgroundColor: "rgba(255, 255, 0, 0.5)"
    };
  }

  const finalScore = gameOver ? calculateFinalScore() : null;
  const currentMaterial = calculateMaterialScore();

  function getPieceSymbol(piece) {
    const symbols = {
      'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
    };
    return symbols[piece] || piece;
  }

  // Calculate truly dead Asura pieces
  const trulyDeadCount = gameMode === 'asura' ?
    Object.values(asuraLives).filter(lives => lives === 0).length : 0;

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 10px #ffd700, inset 0 0 10px rgba(255, 215, 0, 0.3);
          }
          50% { 
            box-shadow: 0 0 25px #ffd700, inset 0 0 20px rgba(255, 215, 0, 0.5);
          }
        }
        @keyframes resurrectPulse {
          0%, 100% {
            box-shadow: 0 0 15px #a855f7, inset 0 0 15px rgba(168, 85, 247, 0.5);
          }
          50% {
            box-shadow: 0 0 35px #a855f7, inset 0 0 25px rgba(168, 85, 247, 0.7);
          }
        }
      `}</style>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: theme.background,
        color: theme.text,
        padding: "20px"
      }}>

        {/* Mode selection screen */}
        {!gameStarted && (
          <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", justifyContent: "center" }}>

            {/* LEFT: Title + Buttons */}
            <div style={{ textAlign: "center", maxWidth: "500px" }}>
              <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
                {gameMode === 'asura' ? '⚔️ ASURA HORDE ⚔️' : 'Chessuranga'}
              </h1>
              <p style={{ fontSize: "18px", marginBottom: "40px", color: "#aaa" }}>
                100-second bullet chess with celestial powers
              </p>

              <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
                <button
                  onClick={() => startGame('pvp')}
                  style={{
                    padding: "20px 40px",
                    fontSize: "20px",
                    backgroundColor: "#4ecca3",
                    color: "#000",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  🌟 Play vs Friend
                </button>

                <button
                  onClick={() => startGame('asura')}
                  style={{
                    padding: "20px 40px",
                    fontSize: "20px",
                    backgroundColor: "#ff4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  👹 Fight the Asura Horde
                </button>
              </div>
            </div>

            {/* RIGHT: How to Play */}
            <div style={{
              width: "320px",
              backgroundColor: "#ff4444",
              border: "3px solid #ff6b6b",
              borderRadius: "16px",
              padding: "24px",
              color: "#fff",
              boxShadow: "0 0 40px rgba(255, 68, 68, 0.4)",
              textAlign: "left",
              flexShrink: 0
            }}>
              <h2 style={{ fontSize: "22px", marginBottom: "16px", textAlign: "center", borderBottom: "2px solid rgba(255,255,255,0.3)", paddingBottom: "10px" }}>
                👹 How to Play Asura Horde
              </h2>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>⚔️ Your Quest</div>
                <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>
                  The Demon King has invaded — and for reasons best not questioned, challenged you to a game of chess.
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>🌟 Your Allies</div>
                <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>
                  The celestial Navagraha have descended to lend you their cosmic powers. Hoss!!
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "6px" }}>🔓 Unlocking Powers</div>
                <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.8" }}>
                  <div>♟ Capture a <strong>pawn</strong> → Tier 1</div>
                  <div>♞ Capture a <strong>knight or bishop</strong> → Tier 2</div>
                  <div>♜ Capture a <strong>rook or queen</strong> → Tier 3</div>
                </div>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>⏱️ Watch the Clock</div>
                <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>
                  Using Navagraha powers costs you time. But capturing Asura demons earns it back — so play bold!
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>☠️ Beware</div>
                <div style={{ fontSize: "13px", opacity: 0.9, lineHeight: "1.5" }}>
                  The demon horde regenerates. Slay them once and they'll return. Only by truly overwhelming them can you win.
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "bold", borderTop: "2px solid rgba(255,255,255,0.3)", paddingTop: "12px" }}>
                Good luck. The cosmos is counting on you. 🙏
              </div>
            </div>

          </div>
        )}

        {gameStarted && (
          <div style={{
            display: "flex",
            gap: "30px",
            alignItems: "flex-start",
            justifyContent: "center",
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto"
          }}>

            {/* LEFT COLUMN: Card info + Cards in 3x3 grid */}
            <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "15px" }}>

              {/* Selected Card Info */}
              <div style={{
                padding: "10px",
                backgroundColor: "#16213e",
                borderRadius: "8px",
                fontSize: "14px",
                minHeight: "110px"
              }}>
                {selectedCard ? (
                  <>
                    <strong style={{ fontSize: "16px" }}>{selectedCard.name}</strong>
                    <div style={{ fontSize: "22px", color: "#ffd700", marginTop: "5px", fontWeight: "bold" }}>
                      {getCardCost(selectedCard)}s
                    </div>
                    <div style={{ fontSize: "15px", color: "#aaa", marginTop: "5px" }}>
                      {selectedCard.description}
                    </div>
                    <div style={{ fontSize: "13px", color: "#aaa", marginTop: "5px" }}>
                      Click board to place
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#555", fontSize: "13px", marginTop: "10px", textAlign: "center" }}>
                    Select a card to see its power
                  </div>
                )}
              </div>

              {/* Activation button */}
              {!selectedCard && !chandraPlacementMode && !guruMode && !shaniMode && piecesInZones.length > 0 && (
                <div>
                  {activationMode ? (
                    <>
                      <div style={{ fontSize: "12px", color: "#ffd700", marginBottom: "10px", padding: "10px", backgroundColor: "#16213e", borderRadius: "8px" }}>
                        💡 Click glowing piece to activate!
                      </div>
                      <button
                        onClick={() => setActivationMode(false)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          fontSize: "12px",
                          backgroundColor: "#e94560",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        Skip Activation
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActivationMode(true)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "13px",
                        backgroundColor: "#ffd700",
                        color: "#000",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      Activate Power ({piecesInZones.length})
                    </button>
                  )}
                </div>
              )}

              {/* GURU resurrection UI */}
              {guruMode && (
                <div style={{
                  padding: "10px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#a855f7" }}>
                    🪐 GURU
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>
                    Click a death square to resurrect:
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>
                    {guruMode.availableResurrections.map((r, i) => (
                      <div key={i}>{getPieceSymbol(r.piece)} at {r.square}</div>
                    ))}
                  </div>
                  <button
                    onClick={cancelGuruMode}
                    style={{
                      width: "100%",
                      padding: "8px",
                      fontSize: "12px",
                      backgroundColor: "#e94560",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* SHANI freeze UI */}
              {shaniMode && (
                <div style={{
                  padding: "10px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#1f2937" }}>
                    🪐 SHANI
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>
                    Click enemy piece to freeze for 2 turns:
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>
                    {shaniMode.enemyPieces.map((p, i) => (
                      <div key={i}>{getPieceSymbol(p.piece.type)} at {p.square}</div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShaniMode(null)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      fontSize: "12px",
                      backgroundColor: "#e94560",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* CHANDRA placement UI */}
              {chandraPlacementMode && (
                <div style={{
                  padding: "10px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px"
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#e5e7eb" }}>
                    🌙 CHANDRA
                  </div>
                  <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "10px" }}>
                    Click empty squares on rank {chandraPlacementMode.rank} to place {chandraPlacementMode.mirages.length}/2 clones
                  </div>
                  <div style={{ fontSize: "11px", color: "#888", marginBottom: "10px" }}>
                    Real piece: {chandraPlacementMode.square}
                  </div>
                  {chandraPlacementMode.mirages.length === 2 && (
                    <div style={{ fontSize: "11px", color: "#ffd700", marginBottom: "10px" }}>
                      +5s penalty for 2nd clone
                    </div>
                  )}

                  <div style={{ fontSize: "11px", color: "#aaa", marginBottom: "5px", marginTop: "10px" }}>
                    Move real piece to:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "10px" }}>
                    {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => {
                      const sq = file + chandraPlacementMode.rank;
                      const isCurrentReal = sq === chandraPlacementMode.square;
                      const isMirage = chandraPlacementMode.mirages.includes(sq);
                      const hasOtherPiece = game.get(sq) && sq !== chandraPlacementMode.square;

                      let wrongColorForBishop = false;
                      if (chandraPlacementMode.piece.type === 'b') {
                        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                        const originalFile = files.indexOf(chandraPlacementMode.square[0]);
                        const originalRank = parseInt(chandraPlacementMode.square[1]);
                        const originalIsLight = (originalFile + originalRank) % 2 === 0;

                        const sqFile = files.indexOf(file);
                        const sqRank = chandraPlacementMode.rank;
                        const sqIsLight = (sqFile + sqRank) % 2 === 0;

                        wrongColorForBishop = originalIsLight !== sqIsLight;
                      }

                      if (hasOtherPiece || wrongColorForBishop) return null;

                      return (
                        <button
                          key={sq}
                          onClick={() => {
                            if (!isCurrentReal && !isMirage) {
                              const newGame = new Chess(game.fen());
                              const piece = newGame.get(chandraPlacementMode.square);
                              newGame.remove(chandraPlacementMode.square);
                              newGame.put(piece, sq);
                              setGame(newGame);

                              setChandraPlacementMode({
                                ...chandraPlacementMode,
                                square: sq
                              });
                            }
                          }}
                          disabled={isCurrentReal || isMirage}
                          style={{
                            width: "30px",
                            height: "30px",
                            fontSize: "9px",
                            backgroundColor: isCurrentReal ? "#ffd700" : (isMirage ? "#e5e7eb" : "#555"),
                            color: isCurrentReal ? "#000" : "#fff",
                            border: "none",
                            borderRadius: "3px",
                            cursor: (isCurrentReal || isMirage) ? "not-allowed" : "pointer",
                            opacity: (isCurrentReal || isMirage) ? 0.5 : 1
                          }}
                        >
                          {file}{chandraPlacementMode.rank}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: "5px" }}>
                    <button
                      onClick={confirmChandraPlacement}
                      disabled={chandraPlacementMode.mirages.length === 0}
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "12px",
                        backgroundColor: chandraPlacementMode.mirages.length > 0 ? "#4ecca3" : "#555",
                        color: chandraPlacementMode.mirages.length > 0 ? "#000" : "#888",
                        border: "none",
                        borderRadius: "5px",
                        cursor: chandraPlacementMode.mirages.length > 0 ? "pointer" : "not-allowed",
                        fontWeight: "bold"
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={cancelChandraPlacement}
                      style={{
                        flex: 1,
                        padding: "8px",
                        fontSize: "12px",
                        backgroundColor: "#e94560",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {chandraMode && (
                <div style={{
                  padding: "10px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#e5e7eb"
                }}>
                  <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                    🌙 CHANDRA ACTIVE
                  </div>
                  <div style={{ color: "#aaa" }}>
                    {Math.ceil(chandraMode.turnsLeft / 2)} turns left
                  </div>
                </div>
              )}

              {/* 3x3 Card Grid */}
              <div>
                <h3 style={{ marginBottom: "10px", textAlign: "center", fontSize: "16px" }}>
                  {gameMode === 'asura' ? '🌟 Navagraha' : 'Cards'}
                </h3>

                {[1, 2, 3].map(tier => {
                  const tierCards = SHARED_DECK.filter(card => card && card.tier === tier);
                  const isUnlocked = (tier === 1 && tier1Unlocked) ||
                    (tier === 2 && tier2Unlocked) ||
                    (tier === 3 && tier3Unlocked);

                  return (
                    <div key={tier} style={{ marginBottom: "15px" }}>
                      <div style={{ fontSize: "11px", marginBottom: "5px", color: "#888", textAlign: "center" }}>
                        Tier {tier} {!isUnlocked && "🔒"}
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "5px"
                      }}>
                        {tierCards.map(card => {
                          const isUsed = usedCards.includes(card.id);
                          const isSelected = selectedCard?.id === card.id;

                          return (
                            <div
                              key={card.id}
                              onClick={() => {
                                if (isUnlocked && !isUsed && !gameOver && game.turn() === 'w') {
                                  setSelectedCard(isSelected ? null : card);
                                }
                              }}
                              style={{
                                aspectRatio: "3/4",
                                backgroundColor: isUnlocked ? card.color : "#333",
                                border: isSelected ? "3px solid #fff" : "2px solid #555",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: (isUnlocked && !isUsed && game.turn() === 'w') ? "pointer" : "default",
                                opacity: isUsed ? 0.3 : 1,
                                overflow: "hidden",   // ← add this so image doesn't spill outside rounded corners
                                padding: 0            // ← remove padding so image fills the card fully
                              }}
                            >
                              {isUnlocked ? (
                                <img
                                  src={card.image}
                                  alt={card.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block"
                                  }}
                                />
                              ) : "🔒"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CENTER: Game Board */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h1 style={{ marginBottom: "20px", fontSize: "32px" }}>
                {gameMode === 'asura' ? '⚔️ ASURA HORDE ⚔️' : 'Chessuranga'}
              </h1>

              {showChaosPopup && (
                <div
                  onClick={() => setShowChaosPopup(false)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#ff6b6b",
                    padding: "12px 24px",
                    borderRadius: "15px",
                    zIndex: 1000,
                    textAlign: "center",
                    border: "3px solid #fff",
                    boxShadow: "0 0 30px rgba(255, 107, 107, 0.5)",
                    cursor: "pointer"
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: "20px" }}>
                    🔥 CHAOS MODE — All cards half price! 🔥
                  </h2>
                  <p style={{ margin: "4px 0 0 0", fontSize: "11px", opacity: 0.8 }}>
                    tap to dismiss
                  </p>
                </div>
              )}

              {gameOver && finalScore && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#16213e",
                  padding: "40px",
                  borderRadius: "15px",
                  zIndex: 1000,
                  textAlign: "center",
                  border: `3px solid ${theme.accent}`
                }}>
                  <h2 style={{ marginBottom: "20px", fontSize: "32px" }}>
                    {gameMode === 'asura' ?
                      (winner === "white" ? "🌟 The Navagraha Prevail! 🌟" : "👹 The Asura Reign! 👹") :
                      `${winner === "white" ? "White" : "Black"} Wins!`
                    }
                  </h2>
                  {gameMode !== 'asura' && (
                    <>
                      <p style={{ fontSize: "20px", marginBottom: "10px" }}>
                        White Score: {finalScore.white}
                      </p>
                      <p style={{ fontSize: "20px", marginBottom: "30px" }}>
                        Black Score: {finalScore.black}
                      </p>
                    </>
                  )}
                  <button onClick={resetGame} style={{
                    padding: "15px 30px",
                    fontSize: "18px",
                    backgroundColor: theme.accent,
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    color: "#000",
                    fontWeight: "bold"
                  }}>
                    Main Menu
                  </button>
                </div>
              )}

              <div style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "10px",
                color: blackTime < 30 ? "#ff6b6b" : theme.text
              }}>
                {gameMode === 'asura' ? '👹 Asura' : 'Black'}: {formatTime(blackTime)}
              </div>

              <div style={{ width: "600px", height: "600px", flexShrink: 0 }}>
                <Chessboard
                  position={game.fen()}
                  onPieceDrop={onPieceDrop}
                  onSquareClick={onSquareClick}
                  customSquareStyles={customStyles}
                  customDarkSquareStyle={{ backgroundColor: theme.darkSquare }}
                  customLightSquareStyle={{ backgroundColor: theme.lightSquare }}
                  boardWidth={600}
                />
              </div>

              <div style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginTop: "10px",
                color: whiteTime < 30 ? "#ff6b6b" : theme.text
              }}>
                {gameMode === 'asura' ? '🌟 You' : 'White'}: {formatTime(whiteTime)}
              </div>

              {!gameOver && (
                <p style={{ marginTop: "15px", fontSize: "16px" }}>
                  Turn: {game.turn() === "w" ? (gameMode === 'asura' ? "You" : "White") : (gameMode === 'asura' ? "Asura" : "Black")}
                  {activationMode && <span style={{ color: "#ffd700", marginLeft: "10px" }}>⚡ ACTIVATION</span>}
                  {chandraPlacementMode && <span style={{ color: "#e5e7eb", marginLeft: "10px" }}>🌙 CLONES</span>}
                  {guruMode && <span style={{ color: "#a855f7", marginLeft: "10px" }}>🪐 RESURRECT</span>}
                  {shaniMode && <span style={{ color: "#1f2937", marginLeft: "10px" }}>🪐 FREEZE</span>}
                  {waitingForBot && <span style={{ color: "#ff6b6b", marginLeft: "10px" }}>👹 Thinking...</span>}
                </p>
              )}
              {!gameOver && (
                <button
                  onClick={resetGame}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    backgroundColor: "#e94560",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Main Menu
                </button>
              )}
            </div>

            {/* RIGHT: Status + Captured */}
            <div style={{
              width: "180px",
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}>

              {/* Asura Status (replaces score in Asura mode) */}
              {gameMode === 'asura' ? (
                <div style={{
                  padding: "15px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px",
                  border: "2px solid #ff4444"
                }}>
                  <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "14px", color: "#ff4444", textAlign: "center" }}>
                    👹 Asura Status
                  </div>
                  <div style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", color: "#ff6b6b" }}>
                    {trulyDeadCount}/16
                  </div>
                  <div style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "5px" }}>
                    Truly Slain
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: "15px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "14px", color: "#888", marginBottom: "10px" }}>Score</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "5px" }}>
                    {currentMaterial.white}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>vs</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {currentMaterial.black}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>
                  {gameMode === 'asura' ? 'You captured:' : 'White captured:'}
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  padding: "10px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px",
                  minHeight: "80px"
                }}>
                  {whiteCaptured.map((piece, i) => (
                    <span key={i} style={{ fontSize: "20px" }}>{getPieceSymbol(piece)}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>
                  {gameMode === 'asura' ? 'Asura captured:' : 'Black captured:'}
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "5px",
                  padding: "10px",
                  backgroundColor: "#16213e",
                  borderRadius: "8px",
                  minHeight: "80px"
                }}>
                  {blackCaptured.map((piece, i) => (
                    <span key={i} style={{ fontSize: "20px" }}>{getPieceSymbol(piece)}</span>
                  ))}
                </div>
              </div>
              {/* Card Costs Info */}
              <div style={{
                padding: "12px",
                backgroundColor: "#16213e",
                borderRadius: "8px",
                fontSize: "12px"
              }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "13px" }}>
                  ⏱️ Card Costs {gameMode === 'asura' && <span style={{ color: "#4ecca3" }}>(50% off!)</span>}
                </div>
                <div style={{ marginBottom: "4px", color: "#aaa" }}>
                  Tier 1: {gameMode === 'asura' ? '4s' : '7-8s'}
                </div>
                <div style={{ marginBottom: "4px", color: "#aaa" }}>
                  Tier 2: {gameMode === 'asura' ? '5-6s' : '9-11s'}
                </div>
                <div style={{ marginBottom: "8px", color: "#aaa" }}>
                  Tier 3: {gameMode === 'asura' ? '5-7s' : '10-14s'}
                </div>
                <div style={{ fontSize: "11px", color: "#888", fontStyle: "italic" }}>
                  Final 30s: All cards 50% off
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;