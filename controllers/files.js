const { body, validationResult } = require("express-validator");
// const asyncHandler = require("express-async-handler");
const passport = require('passport')
const bcrypt = require('bcrypt')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

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

            if(folderId === 'master'){
                res.redirect('/')
                return
            }

            res.redirect(`/folder/${folderId}`)
        } catch (err){
            console.error(err)
            res.status(500).send('Error, try again!')
        }
    }
]

const uploadToDataBase = async (req, filesArr, folderId) => {
    console.log(filesArr, folderId)
    let jobs = filesArr.map(async ({ originalname, destination, path, size }) => {
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
                                url : path,
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
                                url : path,
                            }
                        ]
                    }
                }
            })

        }
    })

    await Promise.all(jobs)
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

        res.render('file', {
            user: req.user,
            file
        })
    } catch {
        res.status('404').send('Page not found')
    }
}