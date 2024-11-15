import { firebaseConfig } from "../logreg/config.js";
// Firebase Auth dan Firestore Initialization
const firebaseApp = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "/logreg";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Elemen HTML
  const flashcard = document.getElementById("flashcard");
  const cardFront = document.getElementById("card-front");
  const cardBack = document.getElementById("card-back");
  const totalCards = document.getElementById("total-cards");
  const completedCards = document.getElementById("completed-cards");
  const remainingCards = document.getElementById("remaining-cards");

  const understoodButton = document.getElementById("understood");
  const notUnderstoodButton = document.getElementById("not-understood");
  const resetButton = document.getElementById("reset");
  const addCardButton = document.getElementById("add-card");
  const questionInput = document.getElementById("question");
  const answerInput = document.getElementById("answer");

  let loadingState = true;

  function saveProgress(uid, fcId) {
    const db = firebase.firestore();

    // Mengupdate data progress ke Firestore dalam koleksi 'users'
    db.collection("users")
      .doc(uid)
      .collection("flashcards")
      .doc(fcId)
      .update({
        answered: true,
      })
      .then(() => {
        console.log("Progress updated successfully");
      })
      .catch((error) => {
        if (error.code === "not-found") {
          console.error("Error: Data not found. Cannot update progress.");
        } else {
          console.error("Error updating progress: ", error);
        }
      });
  }

  // Flashcards Default Array
  let flashcards = [];

  let queue = [];
  let completed = 0;

  // Mengisi informasi awal pada HTML
  //   totalCards.textContent = flashcards.length;
  //   updateCount();
  //   loadNextCard();
  //   displayVocabTable();

  // Event untuk mengelola state pada card
  flashcard.addEventListener("click", () =>
    flashcard.classList.toggle("flipped")
  );

  understoodButton.addEventListener("click", () => {
    if (completed < flashcards.length) {
      const dataId = queue[0].uuid;

      queue.shift();
      completed++;
      updateCount();
      loadNextCard();

      // Simpan progress setelah update
      const progressData = {
        completed: completed,
        queue: queue,
      };
      const user = firebase.auth().currentUser;
      if (user) {
        saveProgress(user.uid, dataId);
      }
    } else {
      alert("Semua kartu sudah selesai! Reset untuk mulai lagi.");
    }
  });

  notUnderstoodButton.addEventListener("click", () => {
    queue.push(queue.shift());
    loadNextCard();
  });

  resetButton.addEventListener("click", () => {
    queue = [...flashcards];
    completed = 0;

    const db = firebase.firestore();
    const user = firebase.auth().currentUser;

    if (user) {
      db.collection("users")
        .doc(user.uid)
        .collection("flashcards")
        .get()
        .then((snapshot) => {
          const batch = db.batch(); // Membuat batch untuk memperbarui beberapa dokumen sekaligus

          snapshot.forEach((doc) => {
            // Untuk setiap dokumen dalam koleksi, set `answered` ke `false`
            batch.update(doc.ref, { answered: false });
          });

          return batch.commit(); // Menjalankan batch untuk memperbarui semua dokumen
        })
        .then(() => {
          console.log("Progress reset successfully for all flashcards");
          updateCount();
          loadNextCard();
        })
        .catch((error) => {
          console.error("Error resetting progress: ", error);
        });
    } else {
      console.error("User is not authenticated.");
    }
  });

  addCardButton.addEventListener("click", () => {
    const newQuestion = questionInput.value;
    const newAnswer = answerInput.value;

    if (newQuestion && newAnswer) {
      const user = firebase.auth().currentUser; // Pastikan user sudah terautentikasi

      if (user) {
        const customUUID = crypto.randomUUID(); // Menghasilkan UUID baru untuk digunakan sebagai ID dokumen
        const flashcardData = {
          uuid: customUUID,
          question: newQuestion,
          answer: newAnswer,
          answered: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // Ubah path collection ke '/users/{uid}/flashcards' dan gunakan UUID sebagai ID dokumen
        firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .collection("flashcards")
          .doc(customUUID) // Menentukan ID dokumen dengan UUID yang sudah dibuat
          .set(flashcardData) // Menggunakan set() alih-alih add() untuk ID kustom
          .then(() => {
            questionInput.value = ""; // Mengosongkan input
            answerInput.value = ""; // Mengosongkan input

            // Tambahkan flashcard baru ke array flashcards dan tampilkan di tabel
            flashcards.push({ ...flashcardData });
            updateCount();
            displayVocabTable(); // Memperbarui tampilan tabel dengan flashcard baru
            loadNextCard(); // Memuat kartu flash berikutnya
          })
          .catch((error) => console.error("Error adding flashcard: ", error));
      }
    } else {
      alert("Tolong isi kedua field.");
    }
  });
  // Menampilkan daftar vocab
  function displayVocabTable() {
    const vocabList = document
      .getElementById("vocab-list")
      .getElementsByTagName("tbody")[0];
    vocabList.innerHTML = "";

    flashcards.forEach((flashcard, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${flashcard.question}</td>
                <td>${flashcard.answer}</td>
                <td><button class="delete-btn" data-index="${index}">Hapus</button></td>
            `;
      vocabList.appendChild(row);
    });

    // Menghapus vocab dari Firestore
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const indexToDelete = e.target.getAttribute("data-index");
        const flashcardToDelete = flashcards[indexToDelete];
        const user = firebase.auth().currentUser; // Ambil user yang sedang login

        if (user) {
          // .collection("users")
          //       .doc(user.uid)
          //       .collection("flashcards")
          //       .doc(customUUID) // Menentukan ID dokumen dengan UUID yang sudah dibuat
          //       .set(flashcardData) // Menggunakan set() alih-alih add() untuk ID kustom

          firebase
            .firestore()
            .collection("users") // Koleksi utama 'users'
            .doc(user.uid) // Menentukan user berdasarkan UID
            .collection("flashcards") // Koleksi sub-flashcards
            .where("uuid", "==", flashcardToDelete.uuid)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => doc.ref.delete());
              flashcards.splice(indexToDelete, 1);
              displayVocabTable();
              totalCards.textContent = flashcards.length;
              updateCount();
              loadNextCard();
            })
            .catch((error) =>
              console.error("Error deleting flashcard: ", error)
            );
        }
      });
    });
  }

  // Fungsi lain
  function loadNextCard() {
    if (queue.length === 0) {
      alert("Semua kartu selesai! Reset untuk mulai lagi.");
      return;
    }
    const currentCard = queue[0];
    cardFront.textContent = currentCard.question;
    cardBack.textContent = currentCard.answer;
  }

  function updateCount() {
    remainingCards.textContent = queue.length;
    completedCards.textContent = completed;
  }

  // Muat flashcards dari Firestore saat autentikasi berubah
  // Muat flashcards dan progress dari Firestore saat autentikasi berubah
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      loadFlashcards();
    }
  });

  // Memuat flashcards dari Firestore
  function loadFlashcards() {
    const user = firebase.auth().currentUser; // Ambil user yang sedang login

    if (user) {
      firebase
        .firestore()
        .collection("users") // Koleksi utama 'users'
        .doc(user.uid) // Menentukan user berdasarkan UID
        .collection("flashcards") // Koleksi sub-flashcards
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            flashcards.push(doc.data());
            if (doc.data().answered === true) {
              completed++;
            }
          });
          queue = flashcards.filter((card) => card.answered === false);
          totalCards.textContent = flashcards.length;
          loadNextCard();
          updateCount();
          displayVocabTable();
        })
        .catch((error) => console.error("Error loading flashcards: ", error));
    }
  }
});
