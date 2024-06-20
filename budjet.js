// Sélection des éléments du DOM
let body = document.body;
let calcule = document.querySelector(".calcule");
let input_un_screen = document.querySelector(".input_un");
let numberVert = document.querySelector(".vert");
let numberVerte = document.querySelector(".verte");
let reset_Buttone = document.querySelector(".reset_Button");
let input_deux_screen = document.querySelector(".input_deux");
let input_trois_screen = document.querySelector(".input_trois");
let botton_expence = document.querySelector(".add_expense");
let numberRouge = document.querySelector(".rouge");
let tbody = document.getElementById("tbody_history");
let alertBody = document.querySelector('.alert-body');

// Variables globales
let total = 0;

// Initialisation des valeurs du localStorage
let budget = JSON.parse(localStorage.getItem("budget") || "0");
let showExpense = JSON.parse(localStorage.getItem("showExpense") || "0");
let balance = JSON.parse(localStorage.getItem("balance") || "0");
let array = JSON.parse(localStorage.getItem("arrayExpense") || "[]");

localStorage.setItem("budget", JSON.stringify(budget));
localStorage.setItem("showExpense", JSON.stringify(showExpense));
localStorage.setItem("balance", JSON.stringify(balance));
localStorage.setItem("arrayExpense", JSON.stringify(array));

// Mise à jour de l'affichage du budget et du solde
function afficheBudget() {
  numberVert.textContent = budget + " F";
  numberVerte.textContent = balance + " F";
}

// Affichage des dépenses dans le tableau
function afficheExpense() {
  tbody.innerHTML = "";
  array.forEach((el, index) => {
    tbody.innerHTML += `
      <tr>
        <td class="align-middle">${index + 1}</td>
        <td class="align-middle">${el.text}</td>
        <td class="align-middle">${el.numbre} F</td>
        <td class="text-center text-nowrap align-middle">
          <div class="d-inline-block mb-1" role="button">
            <i class="bi bi-trash3 bg-danger text-white p-2 rounded delete_icon" data-index="${index}"></i>
          </div>
          <div class="d-inline-block edity mb-1" role="button">
            <i class="bi bi-pencil-square bg-success text-white p-2 rounded" data-index="${index}"></i>
          </div>
        </td>
      </tr>
    `;
  });
  
  

  // Ajout des écouteurs d'événements pour les icônes de suppression et d'édition
  document.querySelectorAll('.delete_icon').forEach(icon => {
    icon.addEventListener('click', deleteExpense);
  });

  document.querySelectorAll('.edity').forEach(icon => {
    icon.addEventListener('click', editExpense);
  });
}

// Suppression d'une dépense
function deleteExpense(event) {
  const index = event.target.getAttribute('data-index');
  const deletedExpense = array.splice(index, 1)[0];
  localStorage.setItem("arrayExpense", JSON.stringify(array));
  
  // Mettre à jour le solde et les dépenses totales
  balance += parseInt(deletedExpense.numbre);
  localStorage.setItem("balance", JSON.stringify(balance));
  expense();
  
  afficheBudget();
  afficheExpense();
  chartElement();
}

// Édition d'une dépense
function editExpense(event) {
  const index = event.target.getAttribute('data-index');
  const expense = array[index];

  input_deux_screen.value = expense.text;
  input_trois_screen.value = expense.numbre;

  botton_expence.removeEventListener('click', addExpense);
  botton_expence.addEventListener('click', function updateExpense() {
    const updatedTitle = input_deux_screen.value;
    const updatedAmount = input_trois_screen.value;

    if (updatedTitle === "" || updatedAmount === "" || isNaN(updatedAmount) || parseInt(updatedAmount) <= 0) {
      alertBody.innerHTML = "Veuillez entrer des valeurs valides pour la dépense";
      alertBody.style.color = "red";
      return;
    }

    balance += parseInt(expense.numbre) - parseInt(updatedAmount);
    localStorage.setItem("balance", JSON.stringify(balance));

    array[index] = { text: updatedTitle, numbre: updatedAmount };
    localStorage.setItem("arrayExpense", JSON.stringify(array));

    afficheBudget();
    afficheExpense();
    chartElement();

    input_deux_screen.value = "";
    input_trois_screen.value = "";

    botton_expence.removeEventListener('click', updateExpense);
    botton_expence.addEventListener('click', addExpense);
  });
}

// Ajout d'une dépense
function addExpense() {
  let expenseTitle = input_deux_screen.value;
  let expenseAmount = input_trois_screen.value;
  if (expenseTitle === "" || expenseAmount === "" || isNaN(expenseAmount) || parseInt(expenseAmount) <= 0) {
    input_deux_screen.style.borderColor = "red";
    input_trois_screen.style.borderColor = "red";
    alertBody.innerHTML = "Veuillez entrer des valeurs valides pour la dépense";
    alertBody.style.color = "red";
    return;
  }

  balance -= parseInt(expenseAmount);
  localStorage.setItem("balance", JSON.stringify(balance));
  alertBody.innerHTML = "Votre dépense a été ajoutée avec succès";
  alertBody.style.color = "green";

  const valeur = {
    text: expenseTitle,
    numbre: expenseAmount
  };
  array.push(valeur);
  localStorage.setItem("arrayExpense", JSON.stringify(array));
  afficheExpense();
  chartElement();
  expense();
  input_deux_screen.value = "";
  input_trois_screen.value = "";
}

// Calcul et affichage des dépenses totales
function expense() {
  total = array.reduce((acc, el) => acc + parseInt(el.numbre), 0);
  showExpense = total;
  localStorage.setItem("showExpense", JSON.stringify(showExpense));
  numberRouge.textContent = showExpense + " F";
}

// Génération d'une couleur aléatoire pour le graphique
function creatColor() {
  let color = "0123456789ABCDEF";
  let htag = "#";
  for (let i = 0; i < 6; i++) {
    htag += color[Math.floor(Math.random() * 16)];
  }
  return htag;
}

// Initialisation du graphique
const ctx = document.getElementById("myChart");
let varChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderWidth: 2
    }]
  }
});

// Mise à jour des données du graphique
function chartElement() {
  varChart.data.labels = array.map(el => el.text);
  varChart.data.datasets[0].data = array.map(el => el.numbre);
  varChart.data.datasets[0].backgroundColor = array.map(() => creatColor());
  varChart.update();
}

// Gestion du clic sur le bouton de réinitialisation
reset_Buttone.addEventListener('click', function() {
  localStorage.clear();
  document.location.reload();
});

// Gestion du clic sur le bouton de calcul du budget
calcule.addEventListener("click", function () {
  let inputBudget = input_un_screen.value;
  if (inputBudget === "") {
    input_un_screen.style.borderColor = "red";
    alertBody.innerHTML = "Veuillez entrer un montant pour votre budget";
    alertBody.style.color = "red";
  } else if (isNaN(inputBudget) || parseInt(inputBudget) <= 0) {
    input_un_screen.style.borderColor = "red";
    alertBody.innerHTML = "Veuillez entrer un montant valide pour votre budget";
    alertBody.style.color = "red";
  } else {
    budget += parseInt(inputBudget);
    localStorage.setItem("budget", JSON.stringify(budget));
    balance += parseInt(inputBudget);
    localStorage.setItem("balance", JSON.stringify(balance));
    afficheBudget();
    alertBody.innerHTML = "Votre budget a été ajouté avec succès";
    alertBody.style.color = "green";
    input_un_screen.value = "";
  }
});

// Ajout d'une dépense
botton_expence.addEventListener('click', addExpense);

// Initialisation des affichages
afficheBudget();
afficheExpense();
expense();
chartElement();
