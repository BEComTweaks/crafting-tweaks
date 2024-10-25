// I sleep now
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enableSelection(element, checkbox) {
  element.classList.add("selected");
  checkbox.checked = true;
}

function disableSelection(element, checkbox) {
  element.classList.remove("selected");
  checkbox.checked = false;
}

function toggleSelection(element) {
  const checkbox = element.querySelector('input[type="checkbox"]');
  // logging
  if (checkbox.checked) {
    disableSelection(element, checkbox);
    console.log(
      `[%cselection%c]\nUnselected ${element.dataset.name}`,
      "color: green",
      "color: initial",
    );
  } else {
    enableSelection(element, checkbox);
    console.log(
      `[%cselection%c]\nSelected ${element.dataset.name}`,
      "color: green",
      "color: initial",
    );
  }
  updateSelectedTweaks();
  var selectedTweaks = getSelectedTweaks();
  var dataCategory = element.dataset.category;
  const selectAllElement =
    element.parentElement.parentElement.parentElement.querySelector(
      ".category-label-selectall",
    );
  if (selectedTweaks[dataCategory]["packs"].length == 0) {
    unselectAll(selectAllElement);
  } else if (
    selectedTweaks[dataCategory]["packs"].length ==
    element.parentElement.querySelectorAll(".tweak").length
  ) {
    selectAll(selectAllElement);
  } else {
    partialSelected(selectAllElement);
  }
  updateURL(selectedTweaks);
  updateDownloadButton(selectedTweaks);
}

function updateDownloadButton(st) {
  const downloadButton = document.querySelector(".download-selected-button");
  if (st["raw"].length == 0) {
    downloadButton.disabled = true;
  } else {
    downloadButton.disabled = false;
  }
}

function updateSelectedTweaks() {
  var selectedTweaks = [];
  const tweakElements = document.querySelectorAll(".tweak.selected");
  tweakElements.forEach((tweak) => {
    const labelElement = tweak.querySelector(".tweak-info .tweak-title");
    selectedTweaks.push("**" + tweak.dataset.category);
    selectedTweaks.push(labelElement.textContent);
  });
  selectedTweaks = [...new Set(selectedTweaks)];
  document.getElementById("selected-tweaks").innerHTML = ""; // Clear the container
  selectedTweaks.forEach((tweak) => {
    const tweakItem = document.createElement("div");
    if (tweak.includes("**")) {
      // tweakItem.className = ("tweakListCategory")
      var label = document.createElement("label");
      tweak = tweak.substring(2);
      label.textContent = tweak;
      label.className = "tweak-list-category";
      tweakItem.append(label);
    } else {
      tweakItem.className = "tweak-list-pack";
      tweakItem.textContent = tweak;
    }
    document.getElementById("selected-tweaks").appendChild(tweakItem);
  });
  // if selected tweaks is empty
  if (selectedTweaks.length == 0) {
    const tweakItem = document.createElement("div");
    tweakItem.className = "tweak-list-pack";
    tweakItem.textContent = "Select some packs and see them appear here!";
    document.getElementById("selected-tweaks").appendChild(tweakItem);
  }
}
// query params function
function updateURL(st) {
  for (var key in st) {
    try {
      if (st[key].packs) {
        // remove categories
        delete st[key];
      }
    } catch (e) {
      // keep raw
    }
  }
  const params = new URLSearchParams(window.location.search);
  let newUrl;
  // remove st raw if empty
  if (st["raw"].length == 0) {
    params.delete("st_raw");
    newUrl = `${window.location.pathname}`;
  } else {
    const stcomp = LZString.compressToEncodedURIComponent(JSON.stringify(st));
    params.set("st_raw", stcomp);
    newUrl = `${window.location.pathname}?${params.toString()}`;
  }
  // update url
  window.history.replaceState({}, "", newUrl);
}
// if query params already exists
const loadedparams = new URLSearchParams(window.location.search);
if (loadedparams.has("st_raw")) {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(loadedparams.get("st_raw")),
  );
  processJsonData(st, "select");
  updateDownloadButton(st);
  const preselectAlerter = document.getElementsByClassName("preselected")[0];
  sleep(500).then(() => {
    // slow down before showing the alert
    preselectAlerter.style.top = "20vh";
  });
  sleep(5000).then(() => {
    preselectAlerter.style.top = "-10vh";
  });
}
// for people who want instant stuff
const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function getTimeoutDuration() {
  return mediaQuery.matches ? 0 : 487.5;
}
// toggle category
function toggleCategory(label) {
  const tweaksContainer = label.parentElement.querySelector(
    ".category-controlled",
  );
  const timeoutDuration = getTimeoutDuration();
  const selectallbutton = label.nextElementSibling;
  if (tweaksContainer.style.maxHeight) {
    // close category
    tweaksContainer.style.maxHeight = null;
    selectallbutton.style.opacity = 0;
    setTimeout(() => {
      tweaksContainer.style.display = "none";
      tweaksContainer.style.paddingTop = null;
      tweaksContainer.style.paddingBottom = null;
      label.classList.remove("open");
      selectallbutton.style.display = "none";
    }, timeoutDuration); // Matches the transition duration
  } else {
    // open category
    tweaksContainer.style.display = "block";
    tweaksContainer.style.paddingTop = "7.5px";
    tweaksContainer.style.paddingBottom = "7.5px";
    label.classList.add("open");
    tweaksContainer.style.maxHeight = tweaksContainer.scrollHeight + "px";
    const outerCatLabel =
      label.parentElement.parentElement.parentElement.querySelector(
        ".category-label",
      );
    const outerCatContainer =
      label.parentElement.parentElement.parentElement.querySelector(
        ".category-controlled",
      );
    if (outerCatLabel) {
      outerCatContainer.style.maxHeight =
        outerCatContainer.scrollHeight + tweaksContainer.scrollHeight + "px";
    }
    selectallbutton.style.display = "block";
    selectallbutton.style.opacity = 1;
  }
}
// i wonder what this is for
function downloadSelectedTweaks() {
  // set min_engine_version
  var mcVersion = document.getElementById("mev").value;
  console.log(
    `[%cdownload%c]\nMinimum Engine Version is set to ${mcVersion}`,
    "color: cyan",
    "color: initial",
  );
  // set pack name
  var packName = document.getElementById("fileNameInput").value;
  if (!packName) {
    packName = `BTCT-${String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      "0",
    )}`;
  }
  packName = packName.replaceAll("/", "-");
  console.log(
    `[%cdownload%c]\nPack Name is set to ${packName}`,
    "color: cyan",
    "color: initial",
  );
  // get selected tweaks
  jsonData = getSelectedTweaks();
  // fetch
  fetchPack("https", jsonData, packName, mcVersion);
}
const serverip = "localhost";

function fetchPack(protocol, jsonData, packName, mcVersion) {
  // get download button
  var downloadbutton = document.getElementsByClassName(
    "download-selected-button",
  )[0];
  // For people that spam the download button
  downloadbutton.onclick = null;
  // Change between border animations
  if (protocol === "http") {
    // when attempting through http
    downloadbutton.classList.remove("s");
    downloadbutton.innerText = "Retrying with HTTP...";
  } else {
    // when attempting through https
    downloadbutton.classList.add("http");
    downloadbutton.classList.add("s");
    downloadbutton.innerText = "Fetching Pack...";
  }

  console.log("[%cfetch%c]\nFetching pack...", "color: blue", "color: initial");
  // fetch
  fetch(`${protocol}://${serverip}/exportCraftingTweak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      packName: packName,
      mcVersion: mcVersion,
    },
    body: JSON.stringify(jsonData),
  })
    .then((response) => {
      // when the response doesnt feel good
      if (!response.ok) {
        console.log(
          "[%cerror%c]\nNetwork response was not ok",
          "color: red",
          "color: initial",
        );
      }
      return response.blob();
    })
    .then(async (blob) => {
      // pack received
      console.log(
        "[%cfetch%c]\nReceived pack!",
        "color: blue",
        "color: initial",
      );
      downloadbutton.innerText = "Obtained pack!";
      downloadbutton.classList.remove("http");
      // When using https, remove the s class
      if (downloadbutton.classList.contains("s")) {
        downloadbutton.classList.remove("s");
      }
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${packName}.mcpack`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      // reset button text
      await sleep(1000);
      downloadbutton.innerText = "Download Selected Tweaks";
      downloadbutton.onclick = downloadSelectedTweaks;
    })
    .catch(async (error) => {
      // when the response doesnt send
      if (protocol === "https") {
        console.log(
          `[%cerror%c]\nHTTPS error, trying HTTP: %c${error}`,
          "color: red",
          "color: initial",
          "color: red",
        );
        fetchPack("http", jsonData, packName, mcVersion); // Retry with HTTP
      } else {
        console.log(
          `[%cerror%c] Error: %c${error}`,
          "color: red",
          "color: initial",
          "color: red",
        );
        downloadbutton.classList.remove("http");
        downloadbutton.innerText =
          "Couldn't fetch pack. Check console for error log.";
        downloadbutton.classList.add("error");
        await sleep(3000);
        downloadbutton.classList.remove("error");
        downloadbutton.innerText = "Download Selected Tweaks";
        downloadbutton.onclick = downloadSelectedTweaks;
      }
    });
}

// process json data from url/json
function processJsonData(jsonData, dowhat) {
  const rawPacks = jsonData.raw;

  if (Array.isArray(rawPacks)) {
    rawPacks.forEach(function (pack) {
      const div = document.querySelector(`div.tweak[data-name="${pack}"]`);
      if (div) {
        if (dowhat == "select") {
          if (!div.querySelector('input[type="checkbox"]').checked) {
            enableSelection(div, div.querySelector('input[type="checkbox"]'));
            console.log(
              `[%cmass%c]\nSelected ${pack}`,
              "color: green",
              "color: initial",
            );
          }
        } else if (dowhat == "unselect") {
          if (div.querySelector('input[type="checkbox"]').checked) {
            disableSelection(div, div.querySelector('input[type="checkbox"]'));
            console.log(
              `[%cmass%c]\nUnselected ${pack}`,
              "color: green",
              "color: initial",
            );
          }
        }
      } else {
        console.log(
          `[%cerror%c]\nDiv with data-name="${pack}" not found.`,
          "color: red",
          "color: initial",
        );
      }
    });
  } else {
    console.log(
      "[%cerror%c]\n%cThe 'raw' field in selected_packs.json is not an array.",
      "color: red",
      "color: initial",
    );
  }
  updateSelectedTweaks();
  updateURL(getSelectedTweaks());
}
// get selected tweaks
function getSelectedTweaks() {
  const selectedTweaks = [];
  const tweakElements = document.querySelectorAll(".tweak.selected");
  tweakElements.forEach((tweak) => {
    selectedTweaks.push({
      category: tweak.dataset.category,
      name: tweak.dataset.name,
      index: parseInt(tweak.dataset.index),
    });
  });
  // yza should explain this
  const tweaksByCategory = {
    Craftables: [],
    "More Blocks": [],
    "Quality of Life": [],
    Unpackables: [],
  };

  const indicesByCategory = {
    Craftables: [],
    "More Blocks": [],
    "Quality of Life": [],
    Unpackables: [],
  };
  console.log(
    "[%cget%c]\nObtaining selected tweaks...",
    "color: purple",
    "color: initial",
  );
  selectedTweaks.forEach((tweak) => {
    tweaksByCategory[tweak.category].push(tweak.name);
    indicesByCategory[tweak.category].push(tweak.index);
  });
  console.log("[%cget%c]\nObtained!", "color: purple", "color: initial");
  const jsonData = {
    Craftables: {
      packs: tweaksByCategory["Craftables"],
      index: indicesByCategory["Craftables"],
    },
    "More Blocks": {
      packs: tweaksByCategory["More Blocks"],
      index: indicesByCategory["More Blocks"],
    },
    "Quality of Life": {
      packs: tweaksByCategory["Quality of Life"],
      index: indicesByCategory["Quality of Life"],
    },
    Unpackables: {
      packs: tweaksByCategory["Unpackables"],
      index: indicesByCategory["Unpackables"],
    },
    raw: selectedTweaks.map((tweak) => tweak.name),
  };
  return jsonData;
}
// Extra code to trigger file input
document
  .querySelector(".zipinputcontainer")
  .addEventListener("click", function () {
    document.getElementById("zipInput").click();
  });
// upload pack
document
  .getElementById("zipInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        JSZip.loadAsync(e.target.result)
          .then(function (zip) {
            let fileFound = false;

            zip.forEach(function (relativePath, zipEntry) {
              if (relativePath.endsWith("selected_packs.json")) {
                fileFound = true;
                zipEntry
                  .async("string")
                  .then(function (content) {
                    try {
                      const jsonData = JSON.parse(content);
                      processJsonData(jsonData, "select");
                    } catch (error) {
                      console.log(
                        `[%cerror%c]\nError parsing JSON: %c${error}`,
                        "color: red",
                        "color: initial",
                        "color: red",
                      );
                    }
                  })
                  .catch(function (error) {
                    console.log(
                      `[%cerror%c]\nError extracting selected_packs.json: %c${error}`,
                      "color: red",
                      "color: initial",
                      "color: red",
                    );
                  });
              }
            });

            if (!fileFound) {
              console.log(
                `[%cerror%c]\nselected_packs.json not found in any folder within the ZIP file.`,
                "color: red",
                "color: initial",
              );
            }
          })
          .catch(function (error) {
            console.log(
              `[%cerror%c]\nError reading ZIP file: %c${error}`,
              "color: red",
              "color: initial",
              "color: red",
            );
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.log(
        `[%cerror%c]\nNo file selected.`,
        "color: red",
        "color: initial",
      );
    }
  });

// select all tweaks
function selectAll(element) {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(element.dataset.allpacks),
  );
  processJsonData(st, "select");
  element.onclick = new Function(`unselectAll(this);`);
  element.innerHTML =
    '<img src="images/select-all-button/chiseled_bookshelf_occupied.png" class="category-label-selectall-img"><div class="category-label-selectall-hovertext">Unselect All</div>';
}

function partialSelected(element) {
  element.innerHTML =
    '<img src="images/select-all-button/chiseled_bookshelf_has_selected.png" class="category-label-selectall-img"><div class="category-label-selectall-hovertext">Select All</div>';
  element.onclick = new Function(`selectAll(this);`);
}

function unselectAll(element) {
  const st = JSON.parse(
    LZString.decompressFromEncodedURIComponent(element.dataset.allpacks),
  );
  processJsonData(st, "unselect");
  element.onclick = new Function(`selectAll(this);`);
  element.innerHTML =
    '<img src="images/select-all-button/chiseled_bookshelf_empty.png" class="category-label-selectall-img"><div class="category-label-selectall-hovertext">Select All</div>';
}
