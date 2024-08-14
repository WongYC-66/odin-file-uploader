const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Read Folder, render page consists of sub-folder and files
exports.folder_get = async (req, res, next) => {
    if (!req.user) {
        res.redirect('/')
        return
    }

    const { folderId } = req.params
    // console.log(folderId)

    // get folder list inside folder of folderId
    const { name: folderName, subFolders } = await prisma.folder.findUnique({
        where: {
            id: Number(folderId)
        },
        select: {
            name: true,
            subFolders: true
        }
    })

    // get file list inside folder of folderId
    const files = await prisma.file.findMany({
        where: {
            folderId: Number(folderId)
        }
    })

    res.render('index', {
        user: req.user,
        subFolders,
        files,
        folderName,
        folderId,
    });
}

// create sub-folder
exports.folder_post = async (req, res, next) => {

    if (!req.user) {
        res.redirect('/')
        return
    }

    const { folderId } = req.params
    const { newFolderName } = req.body

    if (folderId == 'master') {
        // update masterfolder
        await prisma.mainFolder.update({
            where: {
                id: req.user.mainFolderId
            },
            data: {
                subFolders: {
                    create: [
                        { name: newFolderName }
                    ]
                }
            }
        })
        res.redirect('/')
        return
    }

    // update subfolder
    await prisma.folder.update({
        where: {
            id: Number(folderId)
        },
        data: {
            subFolders: {
                create: [
                    { name: newFolderName }
                ]
            }
        }
    })

    res.redirect(`/folder/${folderId}`);
}

// rename sub-folder
exports.folder_update = async (req, res, next) => {

    if (!req.user) {
        res.redirect('/')
        return
    }

    const { folderId } = req.params
    const { updatedFolderName } = req.body
    console.log('update req')


    // update subfolder
    await prisma.folder.update({
        where: {
            id: Number(folderId)
        },
        data: {
            name: updatedFolderName
        }
    })

    if (folderId == 'master') {
        res.json({ redirect: '/' });
        return
    }

    res.json({ redirect: `/folder/${folderId}` });
}
// delete sub-folder
exports.folder_delete = async (req, res, next) => {

    if (!req.user) {
        res.redirect('/')
        return
    }

    const { folderId } = req.params

    console.log('delete req')

    // get the parentId to redirect later
    const { parentId } = await prisma.folder.findUnique({
        where: {
            id: Number(folderId)
        },
        select: {
            parentId: true,
        }
    })

    // update subfolder
    await prisma.folder.delete({
        where: {
            id: Number(targetId)
        },
    })

    if (folderId == 'master')
        res.redirect('/')

    res.redirect(`/folder/${parentId}`);
}