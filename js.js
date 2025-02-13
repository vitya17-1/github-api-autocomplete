document.addEventListener("DOMContentLoaded", () => {
    const repoInput = document.querySelector('.repo-input');
    const autocompleteList = document.querySelector('.autocomplete-list');
    const repoListWrapper = document.querySelector('.repos-list-wrapper');

    let resultItems = [];

    async function searchRepo(input) {
        if (!input.value) {
            clearRepoList();
            return;
        }

        try {
            const response = await fetch(`https://api.github.com/search/repositories?q=${input.value}&per_page=5`);
            if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

            const res = await response.json();
            resultItems = res.items;

            clearRepoList();
            if (resultItems.length > 0) {
                autocompleteList.classList.add('visible');
            }
            resultItems.forEach(createAutocompleteListItem);
        } catch (error) {
            console.error(error);
        }
    }

    function createAutocompleteListItem(item) {
        const autocompleteListItem = document.createElement("li");
        autocompleteListItem.classList.add('autocomplete-list__item');
        autocompleteListItem.textContent = item.name;
        autocompleteListItem.dataset.repoId = item.id;

        autocompleteList.append(autocompleteListItem);
    }

    function clearRepoList() {
        autocompleteList.innerHTML = '';
        autocompleteList.classList.remove('visible');
    }

    function debounce(fn, ms) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), ms);
        };
    }

    const searchRepos = debounce(searchRepo, 500);

    repoInput.addEventListener('input', (event) => {
        searchRepos(event.target);
    });

    autocompleteList.addEventListener('click', (event) => {
        const selectedRepo = resultItems.find(repo => repo.id == event.target.dataset.repoId);
        if (selectedRepo) {
            createRepoListItem(selectedRepo);
            clearRepoList();
            repoInput.value = '';
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-container')) {
            clearRepoList();
        }
    });

    function createRepoListItem(item) {
        const repoListItem = document.createElement("li");
        repoListItem.classList.add('repos-list__item');

        const repoInfo = document.createElement("div");
        repoInfo.classList.add('repo-info');

        const name = document.createElement("p");
        name.textContent = `Name: ${item.name}`;

        const owner = document.createElement("p");
        owner.textContent = `Owner: ${item.owner.login}`;

        const stars = document.createElement("p");
        stars.textContent = `Stars: ${item.stargazers_count}`;

        const deleteButton = document.createElement("button");
        deleteButton.classList.add('delete-repo');
        deleteButton.innerHTML = 'X'; 

        repoInfo.append(name, owner, stars);
        repoListItem.append(repoInfo, deleteButton);
        repoListWrapper.append(repoListItem);
    }

    repoListWrapper.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-repo')) {
            event.target.closest('.repos-list__item').remove();
        }
    });
});