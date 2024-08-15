document.addEventListener('DOMContentLoaded', () => {
    const rename_btn = document.getElementById('rename_btn')
    rename_btn && rename_btn.addEventListener('click', async function (event) {
        event.preventDefault()
        try {
            const folderId = window.location.pathname.split('/').at(-1)
            const updatedFolderName = document.getElementById('newFolderName').value
            // console.log(folderId, updatedFolderName)
            const response = await fetch(`/folder/${folderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ updatedFolderName }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()
            if (data.redirect) {
                window.location.href = data.redirect;
            }

        } catch (error) {
            console.error('Error:', error);
        }
    });

    const delete_btn = document.getElementById('delete_btn')
    delete_btn && delete_btn.addEventListener('click', async function (event) {
        event.preventDefault()

        try {
            const folderId = window.location.pathname.split('/').at(-1)
            const response = await fetch(`/folder/${folderId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()
            if (data.redirect) {
                window.location.href = data.redirect;
            }

        } catch (error) {
            console.error('Error:', error);
        }
    });

    const share_btn = document.getElementById('share_btn')
    share_btn && share_btn.addEventListener('click', async function (event) {
        try {
            const days = prompt("Please enter number of Days, between 1 - 14 ")
            if(isNaN(days) || days <= 0 || days >= 14){
                alert("Please enter a number between 1 - 14")
                throw Error("Must be between 1-14 days")
            }

            let folderId = window.location.pathname.split('/').at(-1)
            if(folderId == '')
                folderId = 'master'

            const response = await fetch(`/share/get-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    days,
                    folderId
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()
            if (data.url) {
                navigator.clipboard.writeText(data.url);
                alert('share link copied to clipboard')
            }

        } catch (error) {
            console.error('Error:', error);
        }
    });
});
