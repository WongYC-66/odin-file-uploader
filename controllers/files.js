const { body, validationResult } = require("express-validator");
// const asyncHandler = require("express-async-handler");
const passport = require('passport')
const bcrypt = require('bcrypt')

// supabase cloud
const { createClient } = require("@supabase/supabase-js")
// Create Supabase client
const supabase = createClient(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_API_KEY)

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const multer = require('multer')
const upload = multer({ dest: './public/uploads/' })

const path = require('path');
const fs = require('fs');
const stream = require('stream');
const { decode } = require('base64-arraybuffer')
// 


exports.files_post = [
    upload.array('uploaded', 100),
    async (req, res, next) => {
        try {
            if (req.files.length <= 0) throw Error()
            const { folderId } = req.params
            console.log({ folderId })

            console.log(req.files)
            await uploadToDataBase(req, req.files, folderId)

            console.log('File uploaded successfully!');

            if (folderId === 'master') {
                res.redirect('/')
                return
            }

            res.redirect(`/folder/${folderId}`)
        } catch (err) {
            console.error(err)
            res.status(500).send('Error, try again!')
        }
    }
]

const uploadToDataBase = async (req, filesArr, folderId) => {
    console.log(filesArr, folderId)

    let jobs = filesArr.map(async (fileInfo) => {

        const { originalname, mimetype, size, path } = fileInfo
        // console.log(fileInfo)

        // Read the file as a binary buffer
        // Convert buffer to base64 string
        const fileBuffer = fs.readFileSync(path);
        const base64Data = fileBuffer.toString('base64');;

        // upload to supabase
        const { data, error } = await supabase.storage
            .from('everything')
            .upload(
                `${req.user.id}/${originalname}`, // file destination in supabase
                decode(base64Data),
                { upsert: true, contentType: mimetype } // option
            )
        // upload = save to /10/logo.webp

        // Delete the file after processing
        fs.unlinkSync(path);
        // console.log(error)
        if (error) throw Error("Supabase Failed", error)

        // console.log({ data, error })
        // data: {
        //     path: '1/logo.webp',
        //     id: '57069359-04c7-4dba-b7d6-20a6c0ac64f6',
        //     fullPath: 'everything/1/logo.webp'
        //  },
        const database_URL = data.path

        if (folderId == 'master') {
            const mainFolder = await prisma.mainFolder.update({
                where: {
                    id: req.user.mainFolderId
                },
                data: {
                    files: {
                        create: [
                            {
                                name: originalname,
                                size,
                                url: database_URL,
                            }
                        ]
                    }
                }
            })
        } else {
            const subFolder = await prisma.folder.update({
                where: {
                    id: Number(folderId)
                },
                data: {
                    files: {
                        create: [
                            {
                                name: originalname,
                                size,
                                url: database_URL,
                            }
                        ]
                    }
                }
            })

        }
    })

    await Promise.allSettled(jobs)
    return
}

exports.file_get = async (req, res, next) => {
    console.log('getting file')
    const { fileId } = req.params

    try {

        const file = await prisma.file.findUnique({
            where: {
                id: Number(fileId)
            },
            include: {
                Folder: true,
                mainFolder: true,
            }
        })
        console.log(file)

        // get download link from supabase
        const { data, error } = await supabase
            .storage
            .from('everything')
            .createSignedUrl(file.url, 3600, { download: true })  // URL valid for 3600 seconds
        console.log(data)
        if (data)
            file.url = data.signedUrl

        res.render('file', {
            user: req.user,
            file
        })
    } catch {
        res.status('404').send('Page not found')
    }
}