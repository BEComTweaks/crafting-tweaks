function showLoading() {
    if (window.innerWidth > 768) {
        document.getElementById('loading-circle').style.display = 'block';
    }
}
function hideLoading() {
    document.getElementById('loading-circle').style.display = 'none';
}
function toggleSelection(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
}

function toggleCategory(label) {
    const tweaksContainer = label.nextElementSibling;
    tweaksContainer.style.display = tweaksContainer.style.display != 'grid' ? 'grid' : 'none';
}

function downloadSelectedTweaks() {
    var packName = document.getElementById('fileNameInput').value;
    if (!packName) {
        packName = `BTCT-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`
    }
    packName = packName.replaceAll('/', '-')
        const selectedTweaks = [];
    const tweakElements = document.querySelectorAll('.tweak.selected');
    tweakElements.forEach(tweak => {
        selectedTweaks.push({
            category: tweak.dataset.category,
            name: tweak.dataset.name,
            index: parseInt(tweak.dataset.index)
        });
    });

    const tweaksByCategory = {
        "Craftables": [],
        "More Blocks": [],
        "Quality of Life": [],
        "Unpackables": []
    };

    const indicesByCategory = {
        "Craftables": [],
        "More Blocks": [],
        "Quality of Life": [],
        "Unpackables": []
    };

    selectedTweaks.forEach(tweak => {
        tweaksByCategory[tweak.category].push(tweak.name);
        indicesByCategory[tweak.category].push(tweak.index);
    });

    const jsonData = {
        "Craftables": {
            "packs": tweaksByCategory["Craftables"],
            "index": indicesByCategory["Craftables"]
        },
        "More Blocks": {
            "packs": tweaksByCategory["More Blocks"],
            "index": indicesByCategory["More Blocks"]
        },
        "Quality of Life": {
            "packs": tweaksByCategory["Quality of Life"],
            "index": indicesByCategory["Quality of Life"]
        },
        "Unpackables": {
            "packs": tweaksByCategory["Unpackables"],
            "index": indicesByCategory["Unpackables"]
        },
        "raw": selectedTweaks.map(tweak => tweak.name)
    };
    fetchPack('https', jsonData, packName)
}
const serverip = 'localhost';

function fetchPack(protocol, jsonData, packName) {
    showLoading();
    fetch(`${protocol}://${serverip}/exportCraftingTweak`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'packName': packName
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        hideLoading();
        return response.blob();
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${packName}.mcpack`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        if (protocol === 'https') {
            console.error('HTTPS error, trying HTTP:', error);
            fetchPack('http', jsonData, packName); // Retry with HTTP
        } else {
            console.error('Error:', error);
        }
    });
}
