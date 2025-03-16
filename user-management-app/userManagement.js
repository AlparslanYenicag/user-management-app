const appendLocation = '#app';

function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        ${appendLocation} {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            margin: 5px 0;
            background: #f5f5f5;
            border-radius: 4px;
        }
        button {
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.2s;
        }
        button:hover {
            background: #0056b3;
        }
        li button {
            background: #dc3545;
        }
        li button:hover {
            background: #c82333;
        }
        #reloadUsers {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 12px;
            font-size: 16px;
            background: #28a745;
        }
        #reloadUsers:hover {
            background: #218838;
        }
    `;
    document.head.appendChild(style);
}

async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const users = await response.json();
        localStorage.setItem('users', JSON.stringify({
            data: users,
            expiration: Date.now() + (24 * 60 * 60 * 1000) // 24 saat
        }));
        sessionStorage.removeItem('allUsersDeleted'); // Kullanıcılar yüklendiğinde flag'i kaldır
        return users;
    } catch (error) {
        console.error('Kullanıcılar getirilirken hata oluştu:', error);
        return null;
    }
}

function getStoredUsers() {
    const stored = JSON.parse(localStorage.getItem("users"));
    if (!stored || !stored.data || !stored.expiration || Date.now() > stored.expiration) {
        localStorage.removeItem("users");
        return null;
    }
    return stored.data;
}

function createUserList(users) {
    const container = document.querySelector(appendLocation);
    if (!container) return;

    container.innerHTML = '';

    if (!users || users.length === 0 || sessionStorage.getItem('allUsersDeleted') === 'true') {
        if (!sessionStorage.getItem("reloadUsed")) {
            showReloadButton();
        }
        return;
    }

    const ul = document.createElement('ul');
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email}) `;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Sil';
        deleteButton.addEventListener('click', () => deleteUser(user.id));
        li.appendChild(deleteButton);
        ul.appendChild(li);
    });
    container.appendChild(ul);
}

function deleteUser(userId) {
    const stored = JSON.parse(localStorage.getItem('users'));
    if (!stored || !stored.data) return;

    const updatedUsers = stored.data.filter(user => user.id !== userId);
    
    if (updatedUsers.length === 0) {
        localStorage.removeItem('users'); // Tüm kullanıcılar silindiğinde localStorage'ı temizle
        sessionStorage.setItem('allUsersDeleted', 'true');
    } else {
        localStorage.setItem('users', JSON.stringify({
            data: updatedUsers,
            expiration: stored.expiration
        }));
    }

    createUserList(updatedUsers);
}

function showReloadButton() {
    const container = document.querySelector(appendLocation);
    if (!container || container.querySelector("#reloadUsers")) return;

    const button = document.createElement('button');
    button.textContent = "Kullanıcıları Yenile";
    button.id = "reloadUsers";

    button.addEventListener("click", async () => {
        sessionStorage.setItem("reloadUsed", "true");
        localStorage.removeItem("users");
        const users = await fetchUsers();
        createUserList(users);
    });

    container.appendChild(button);
}

const observer = new MutationObserver(() => {
    const container = document.querySelector(appendLocation);
    if (container && !container.querySelector('ul') && !sessionStorage.getItem("reloadUsed")) {
        showReloadButton();
    }
});

async function initApp() {
    const container = document.querySelector(appendLocation);
    if (!container) return;

    observer.observe(container, { childList: true });
    addStyles(); // Stilleri ekle

    let users = getStoredUsers();
    if (!users) {
        users = await fetchUsers();
    }
    createUserList(users);
}

initApp();
