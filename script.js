document.addEventListener('DOMContentLoaded', () => {
    const puzzleFrame = document.getElementById('puzzleFrame');
    const piecesContainer = document.getElementById('piecesContainer');
    const puzzleImageReveal = document.getElementById('puzzleImageReveal');
    const messageContainer = document.getElementById('messageContainer');
    const progressMessage = document.getElementById('progressMessage');

    const gridSize = 3;
    const totalPieces = gridSize * gridSize;
    let placedPiecesCount = 0;

    const progressMessages = [
        "Sayangg aku mau minta maaff banya banyaa 🥺",
        "maaff aku bikin kamu marahh teruss 🥺",
        "maaff dari kemarin aku buat masalah teruss",
        "maaff aku nambahin pusing kamuu",
        "maafff aku masih melakukan kesalahan yang samaa..",
        "Tapi aku janji aku akan berubah jadi lebih baik sayangg🥺",
        "aku sayangg kamuu🥺❣️",
        "aku cinta kamuuuu🥺❣️",
        "Kita baikan yaa sayangg🥺❣️",
    ];

    // Create Slots
    for (let i = 0; i < totalPieces; i++) {
        const slot = document.createElement('div');
        slot.classList.add('puzzle-slot');
        slot.dataset.index = i;
        
        // Create Hint
        const hint = document.createElement('div');
        hint.classList.add('hint-shape');
        hint.style.backgroundImage = `url('assets/piece-${i + 1}.png')`;
        slot.appendChild(hint);

        puzzleFrame.appendChild(slot);
    }

    // Create Pieces
    const pieces = [];
    for (let i = 0; i < totalPieces; i++) {
        const piece = document.createElement('div');
        piece.classList.add('puzzle-piece');
        piece.style.backgroundImage = `url('assets/piece-${i + 1}.png')`;
        piece.draggable = true;
        piece.dataset.index = i;
        pieces.push(piece);
    }

    // Shuffle and append pieces
    shuffleArray(pieces).forEach(piece => {
        piecesContainer.appendChild(piece);
    });

    // Drag and Drop Logic
    let draggedPiece = null;

    // Desktop (Mouse) Events
    pieces.forEach(piece => {
        piece.addEventListener('dragstart', (e) => {
            if (piece.classList.contains('placed')) {
                e.preventDefault();
                return;
            }
            draggedPiece = piece;
            e.dataTransfer.setData('text/plain', piece.dataset.index);
            e.dataTransfer.effectAllowed = 'move';
            // Use setTimeout to allow the drag image to be created before hiding the element
            setTimeout(() => piece.classList.add('dragging'), 0);
        });

        piece.addEventListener('dragend', () => {
            if (draggedPiece) {
                draggedPiece.classList.remove('dragging');
                draggedPiece = null;
            }
        });
    });

    const slots = document.querySelectorAll('.puzzle-slot');
    slots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = 'move';
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            const pieceIndex = e.dataTransfer.getData('text/plain');
            const slotIndex = slot.dataset.index;

            if (pieceIndex === slotIndex && !slot.classList.contains('filled')) {
                // Correct Drop
                placePiece(slot, draggedPiece);
            }
        });
    });

    // Mobile (Touch) Events
    let touchStartX = 0;
    let touchStartY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let activePiece = null;

    pieces.forEach(piece => {
        piece.addEventListener('touchstart', (e) => {
            if (piece.classList.contains('placed')) return;
            
            activePiece = piece;
            const touch = e.touches[0];
            const rect = piece.getBoundingClientRect();
            
            // Calculate offset from top-left of the piece
            touchStartX = touch.clientX - rect.left;
            touchStartY = touch.clientY - rect.top;
            
            // Set absolute positioning for dragging
            piece.style.position = 'fixed';
            piece.style.left = rect.left + 'px';
            piece.style.top = rect.top + 'px';
            piece.style.zIndex = 1000;
            piece.style.width = rect.width + 'px';
            piece.style.height = rect.height + 'px';
            
            e.preventDefault(); // Prevent scrolling
        }, { passive: false });

        piece.addEventListener('touchmove', (e) => {
            if (!activePiece) return;
            
            const touch = e.touches[0];
            activePiece.style.left = (touch.clientX - touchStartX) + 'px';
            activePiece.style.top = (touch.clientY - touchStartY) + 'px';
            
            e.preventDefault();
        }, { passive: false });

        piece.addEventListener('touchend', (e) => {
            if (!activePiece) return;

            // Check if dropped over correct slot
            const pieceRect = activePiece.getBoundingClientRect();
            const pieceCenter = {
                x: pieceRect.left + pieceRect.width / 2,
                y: pieceRect.top + pieceRect.height / 2
            };

            // Find element under the center of the piece
            activePiece.style.visibility = 'hidden'; // Hide momentarily to find element below
            const elementBelow = document.elementFromPoint(pieceCenter.x, pieceCenter.y);
            activePiece.style.visibility = 'visible';

            const slot = elementBelow ? elementBelow.closest('.puzzle-slot') : null;

            if (slot && slot.dataset.index === activePiece.dataset.index && !slot.classList.contains('filled')) {
                // Correct Drop
                resetPieceStyles(activePiece);
                placePiece(slot, activePiece);
            } else {
                // Return to container
                resetPieceStyles(activePiece);
                activePiece.style.position = '';
                activePiece.style.left = '';
                activePiece.style.top = '';
                activePiece.style.zIndex = '';
            }

            activePiece = null;
        });
    });

    function resetPieceStyles(piece) {
        piece.style.position = '';
        piece.style.left = '';
        piece.style.top = '';
        piece.style.zIndex = '';
        piece.style.width = '';
        piece.style.height = '';
    }

    function placePiece(slot, piece) {
        slot.appendChild(piece);
        slot.classList.add('filled');
        piece.classList.add('placed');
        piece.draggable = false;
        
        // Show Progress Message
        if (placedPiecesCount < progressMessages.length) {
            progressMessage.textContent = progressMessages[placedPiecesCount];
            progressMessage.classList.add('visible');
            
            // Optional: Hide after a few seconds? Or keep until next piece?
            // Let's keep it visible for a bit then fade out, or just switch text.
            // If we fade out, we need logic. Let's just keep it visible for now or fade out after 2s.
            
            // Reset opacity for transition effect if needed, but simple text switch is fine.
            // To make it "pop" each time, we can toggle the class.
            progressMessage.classList.remove('visible');
            setTimeout(() => {
                progressMessage.classList.add('visible');
            }, 50);
        }

        placedPiecesCount++;
        
        if (placedPiecesCount === totalPieces) {
            handleCompletion();
        }
    }

    function handleCompletion() {
        setTimeout(() => {
            // Hide progress message
            progressMessage.classList.remove('visible');

            // 1. Reveal Image
            puzzleImageReveal.classList.add('visible');
            
            // Optional: Hide pieces borders/backgrounds to make image clearer?
            // The image is an overlay on top of slots (z-index 10), so pieces are covered.
            
            // 2. Show Message
            setTimeout(() => {
                messageContainer.classList.remove('hidden');
                // Trigger reflow to enable transition
                void messageContainer.offsetWidth; 
                messageContainer.classList.add('visible');
            }, 1000);
            
        }, 4000); // Extended delay to let user read the last message
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
