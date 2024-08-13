const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production')
    require('dotenv').config()

const main = async () => {
    console.log("starting to populate db...")

    const user1 = await prisma.user.create({
        data: {
            username: 'admin1',
            password: bcrypt.hashSync('admin1', 10),
            mainFolder: {
                create: {
                    subFolders: {
                        create: [
                            {
                                name: 'my_photo',
                            },
                            {
                                name: 'my_diary',
                                files: {
                                    create: [
                                        {
                                            name: "diary_001.txt",
                                            link: 'fake_link_001'
                                        },
                                        {
                                            name: "diary_002.txt",
                                            link: 'fake_link_002'
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            }
        },
    })

    const updatedUser1 = await prisma.mainFolder.update({
        where: { id: user1.mainFolderId },
        data: {
            subFolders: {
                create: [
                    {
                        name: 'my_nested_folder',
                        subFolders: {
                            create: [
                                { name: 'sub_folder_001'},
                                { name: 'sub_folder_002'},
                            ]
                        }
                    }
                ]
            }
        }
    })


    const user2 = await prisma.user.create({
        data: {
            username: 'admin2',
            password: bcrypt.hashSync('admin2', 10),
            mainFolder: {
                create: {}
            }
        },
    })

    const user3 = await prisma.user.create({
        data: {
            username: 'user1',
            password: bcrypt.hashSync('user1', 10),
            mainFolder: {
                create: {}
            }
        },
    })

    console.log("done populating db...")
}

main()
    .catch(e => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });