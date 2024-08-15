const { PrismaClient } = require('@prisma/client')
const passport = require('passport')
const moment = require('moment');
// 
const prisma = new PrismaClient()
// supabase cloud
const { createClient } = require("@supabase/supabase-js")
// Create Supabase client
const supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_API_KEY)

// 


exports.link_post = async (req, res, next) => {
    if (!req.user)
        return res.status(403).send("Forbidden")

    let { days, folderId } = req.body

    if (!days || folderId == undefined)
        return res.status(400).send('Folder ID and duration are required.');

    if (isNaN(days) || Number(days) <= 0 || Number(days) > 14)
        return res.status(400).send('Days must be between 1 - 14.');
    // console.log(days,folderId)
    // console.log(days,folderId)

    try {
        const isMainFolder = folderId == 'master'
        if (isMainFolder)
            folderId = req.user.mainFolderId

        const expirationDate = moment().add(days, 'days').toDate();
        const shareLink = await prisma.shareLink.create({
            data: {
                folderId: Number(folderId),
                expirationDate,
                isMainFolder,
            }
        });
        // console.log(expirationDate)
        // console.log(shareLink)

        const linkUrl = `${req.protocol}://${req.get('host')}/share/folder/${shareLink.id}`;
        res.json({ url: linkUrl });
    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: 'An error occurred while creating the share link.' });
    }
}

exports.folder_get = async (req, res, next) => {
    let { linkId, folderId } = req.params;
    // console.log(linkId, folderId)

    try {
        let isMainFolder = false
        const shareLink = await prisma.shareLink.findUnique({
            where: { id: linkId }
        })

        if (!folderId) {
            folderId = shareLink.folderId
            if(shareLink.isMainFolder)
                isMainFolder = true
        }

        if (!shareLink) {
            return res.status(404).send({ error: 'Share link not found.' });
        }

        if (moment().isAfter(shareLink.expirationDate)) {
            return res.status(403).send({ error: 'Share link has expired.' });
        }

        // console.log(shareLink)
        // console.log(isMainFolder)
        // Serve the folder contents
        if (isMainFolder) {
            var name = 'Home'
            var { subFolders } = await prisma.mainFolder.findUnique({
                where: {
                    id: Number(folderId)
                },
                select: {
                    subFolders: true,
                }
            })

            var files = await prisma.file.findMany({
                where: {
                    mainFolderId: Number(folderId)
                }
            })

        } else {
            var { name, subFolders } = await prisma.folder.findUnique({
                where: {
                    id: Number(folderId)
                },
                select: {
                    subFolders: true,
                    name: true
                }
            })

            var files = await prisma.file.findMany({
                where: {
                    folderId: Number(folderId)
                }
            })
        }

        res.render('shareFolder', {
            subFolders,
            files,
            folderName: `Shared-folder-${name}`,
            linkId: linkId,
        });


    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: 'An error occurred while accessing the share link.' });
    }
}

exports.file_get = async (req, res, next) => {
    let { linkId, fileId } = req.params;
    // console.log(linkId, fileId)

    try {
        const shareLink = await prisma.shareLink.findUnique({
            where: { id: linkId }
        })

        if (!shareLink) {
            return res.status(404).send({ error: 'Share link not found.' });
        }

        if (moment().isAfter(shareLink.expirationDate)) {
            return res.status(403).send({ error: 'Share link has expired.' });
        }

        // console.log(shareLink)
        // Serve the file contents
        const file = await prisma.file.findUnique({
            where: {
                id: Number(fileId)
            },
            include: {
                Folder: true,
                mainFolder: true,
            }
        })
        // console.log(file)

        // get download link from supabase
        const { data, error } = await supabase
            .storage
            .from('everything')
            .createSignedUrl(file.url, 3600, { download: true })  // URL valid for 3600 seconds
        // console.log(data)
        if (data)
            file.url = data.signedUrl

        res.render('shareFile', {
            file
        })


    } catch (error) {
        // console.log(error)
        res.status(500).json({ error: 'An error occurred while accessing the share link.' });
    }
}