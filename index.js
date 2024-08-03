async function getAddressByCep(cep) {
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);

    if (!response.ok) {
      return { ok: false, error: "not found" };
    }

    const data = await response.json();

    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "unknown" };
  }
}

const form = document.querySelector("#main-form");

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const cpfInput = document.querySelector("#cpf");
const cnpjInput = document.querySelector("#cnpj");
const cepInput = document.querySelector("#cep");
const stateInput = document.querySelector("#state");
const cityInput = document.querySelector("#city");
const neighborhoodInput = document.querySelector("#neighborhood");
const streetInput = document.querySelector("#street");
const numberInput = document.querySelector("#number");

const testCep = (cep) => {
  return /^[0-9]{5}-[0-9]{3}$/.test(cep);
};

cepInput.addEventListener("input", async (e) => {
  cepInput.removeAttribute("state");
  const cep = e.target.value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d{3})/, "$1-$2");
  cepInput.value = cep;

  if (!testCep(cep)) {
    return;
  }

  cepInput.setAttribute("state", "loading");

  const { ok, data, error } = await getAddressByCep(cep);

  if (!ok) {
    cepInput.setAttribute("state", "error");
    return;
  }

  cepInput.removeAttribute("state");

  stateInput.value = data.state;
  cityInput.value = data.city;
  neighborhoodInput.value = data.neighborhood;
  streetInput.value = data.street;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
});
