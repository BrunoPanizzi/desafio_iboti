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

class InputField {
  constructor(fieldName) {
    this.fieldName = fieldName;

    this.wrapper = document.querySelector(`label[for="${fieldName}"]`);
    if (!this.wrapper) {
      throw new Error(`Could not find label[for="${fieldName}"].`);
    }

    this.input = this.wrapper.querySelector("input");
    if (!this.input) {
      throw new Error(`Could not find input inside label.`);
    }

    this.errorMessage = this.wrapper.querySelector(".field-error");
    if (!this.errorMessage) {
      throw new Error(`Could not find error message field inside label.`);
    }

    this.onInput(() => this.removeErrors());
    this.validator = (value) => value.length > 0;
  }

  setError(message) {
    this.input.setAttribute("state", "error");
    this.errorMessage.textContent = message;
  }
  removeErrors() {
    if (this.input.getAttribute("state") === "error") {
      this.input.removeAttribute("state");
    }

    this.errorMessage.textContent = "";
  }

  setLoading() {
    this.input.setAttribute("state", "loading");
    this.input.setAttribute("disabled", true);
  }
  removeLoading() {
    if (this.input.getAttribute("state") === "loading") {
      this.input.removeAttribute("state");
    }

    this.input.removeAttribute("disabled");
  }

  onInput(fn) {
    this.input.addEventListener("input", fn);
  }

  // returns the value of the input if it's valid based on validator
  // validator can be set like `input.validator = (value) => value.length > 5`
  // default validator checks for empty string
  valueOrError(error) {
    if (!this.validator(this.value)) {
      this.setError(error);
      return null;
    }
    return this.value;
  }

  valueOrThrow(config) {
    let valid = false;
    if (config.validator && typeof config.validator === "function") {
      valid = validator(this.value);
    } else {
      valid = this.value.length > 0;
    }

    if (!valid) {
      this.setError(config.message);
      throw new Error(
        `invalid value for input ${this.fieldName}: ${this.value}`
      );
    }

    return this.value;
  }
  get value() {
    return this.input.value;
  }
  set value(newVal) {
    this.input.value = newVal;
  }
}

const form = document.querySelector("#main-form");

const inputNames = [
  "name",
  "email",
  "phone",
  "cpf",
  "cnpj",
  "cep",
  "state",
  "city",
  "neighborhood",
  "street",
  "number",
];

// generate object with all the inputs names
const inputs = inputNames.reduce((acc, curr) => {
  acc[curr] = new InputField(curr);
  return acc;
}, {});
inputs.email.validator = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
inputs.phone.validator = (phone) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone);
inputs.cpf.validator = (cpf) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
inputs.cnpj.validator = (cnpj) =>
  /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
inputs.cep.validator = (cep) => /^\d{5}-\d{3}$/.test(cep);
inputs.number.validator = (number) => Number(number) > 0;

const testCep = (cep) => {
  return /^[0-9]{5}-[0-9]{3}$/.test(cep);
};

inputs.cep.onInput(async (e) => {
  const cep = e.target.value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d{3})/, "$1-$2");
  inputs.cep.value = cep;

  if (!testCep(cep)) {
    return;
  }

  inputs.cep.setLoading();

  const { ok, data } = await getAddressByCep(cep);

  inputs.cep.removeLoading();

  if (!ok) {
    return inputs.cep.setError("Cep não encontrado.");
  }

  inputs.state.value = data.state;
  inputs.city.value = data.city;
  inputs.neighborhood.value = data.neighborhood;
  inputs.street.value = data.street;
});

inputs.phone.onInput(() => {
  let phone = inputs.phone.value.replace(/\D/g, "");

  if (phone.length > 11) {
    phone = phone.substring(0, 11);
  }

  if (phone.length <= 2) {
    //
  } else if (phone.length <= 6) {
    phone = phone.replace(/(\d{2})(\d{0,4})(\d{0,4})/, "($1) $2");
  } else if (phone.length <= 10) {
    phone = phone.replace(/(\d{2})(\d{0,4})(\d{0,4})/, "($1) $2-$3");
  } else {
    phone = phone.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  }

  inputs.phone.value = phone;
});

inputs.cpf.onInput(() => {
  let cpf = inputs.cpf.value;

  cpf = cpf.replace(/\D/g, "");

  if (cpf.length > 11) {
    cpf = cpf.substring(0, 11);
  }

  if (cpf.length <= 9) {
    cpf = cpf
      .replace(/(\d{3})(\d{0,3})(\d{0,3})/, "$1.$2.$3")
      .replace(/\.$/, "");
  } else {
    cpf = cpf
      .replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4")
      .replace(/[-.]$/, "");
  }

  inputs.cpf.value = cpf;
});

inputs.cnpj.onInput(() => {
  let cnpj = inputs.cnpj.value;

  cnpj = cnpj.replace(/\D/g, "");

  if (cnpj.length > 14) {
    cnpj = cnpj.substring(0, 14);
  }
  if (cnpj.length > 2 && cnpj.length <= 5) {
    cnpj = cnpj.replace(/(\d{2})(\d{0,3})/, "$1.$2");
  } else if (cnpj.length > 5 && cnpj.length <= 8) {
    cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else if (cnpj.length > 8 && cnpj.length <= 12) {
    cnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
  } else if (cnpj.length > 12) {
    cnpj = cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  inputs.cnpj.value = cnpj;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let errors = false;
  let fields = inputNames.reduce((acc, curr) => {
    const value = inputs[curr].valueOrError("");
    if (value === null) errors = true;
    acc[curr] = value;
    return acc;
  }, {});

  if (errors) {
    const formError = form.querySelector(".form-error");
    formError.textContent = "Preencha os campos em vermelho";

    return;
  }

  alert(JSON.stringify(fields));
});

form.addEventListener("input", () => {
  const formError = form.querySelector(".form-error");

  formError.textContent = "";
});

const themeToggle = document.querySelector("#theme-toggle");
const themeImg = themeToggle.querySelector("img");

themeToggle.addEventListener("click", () => {
  const html = document.querySelector("html");

  let theme = html.getAttribute("data-theme");
  if (theme === "light") {
    theme = "dark";
    themeImg.src = "assets/sun.svg";
    themeImg.alt = "tema claro";
  } else {
    theme = "light";
    themeImg.src = "assets/moon.svg";
    themeImg.alt = "tema escuro";
  }

  html.setAttribute("data-theme", theme);
});
