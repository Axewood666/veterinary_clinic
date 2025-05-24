const db = require('../db/database')
const logger = require('../utils/logger');
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.userid;
        const pets = await db('pets').where('userid', userId);
        const upcomingAppointments = await db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'vets.name as vet_name'
            )
            .where('pets.userid', userId)
            .whereIn('appointments.status', ['scheduled', 'accepted'])
            .orderBy('appointments.date', 'asc')
            .limit(5);
        const pastAppointments = await db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'vets.name as vet_name'
            )
            .where('pets.userid', userId)
            .where('appointments.status', 'completed')
            .orderBy('appointments.date', 'desc')
            .limit(5);
        res.render('pages/client/dashboard', {
            title: 'Личный кабинет',
            pets,
            upcomingAppointments,
            pastAppointments,
            user: req.user
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке личного кабинета: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке личного кабинета',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userid;
        const user = await db('users').where('userid', userId).first();
        res.render('pages/client/profile', {
            title: 'Мой профиль',
            user,
            success: req.query.success
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке профиля: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке профиля',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { name, email, phoneNumber } = req.body;
        if (!name || !email || !phoneNumber) {
            return res.render('pages/client/profile', {
                title: 'Мой профиль',
                user: req.body,
                error: 'Все поля должны быть заполнены'
            });
        }
        await db('users')
            .where('userid', userId)
            .update({
                name,
                email,
                phoneNumber
            });
        res.redirect('/client/profile?success=true');
    } catch (error) {
        logger.error(`Ошибка при обновлении профиля: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при обновлении профиля',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getAllPets = async (req, res) => {
    try {
        const userId = req.user.userid;
        const pets = await db('pets').where('userid', userId);
        res.render('pages/client/pets', {
            title: 'Мои питомцы',
            pets,
            success: req.query.success
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке списка питомцев: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке списка питомцев',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getAddPetForm = (req, res) => {
    res.render('pages/client/add-pet', {
        title: 'Добавление питомца',
        formData: {}
    });
};
exports.addPet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { name, type, breed, age, gender, medicalhistory } = req.body;
        if (!name || !type || !breed || !age || !gender) {
            return res.render('pages/client/add-pet', {
                title: 'Добавление питомца',
                formData: req.body,
                error: 'Заполните все обязательные поля'
            });
        }
        await db('pets').insert({
            userid: userId,
            name,
            type,
            breed,
            age,
            gender,
            medicalhistory: medicalhistory || null
        });
        res.redirect('/client/pets?success=added');
    } catch (error) {
        logger.error(`Ошибка при добавлении питомца: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при добавлении питомца',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getPet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        const pet = await db('pets')
            .where('petid', petId)
            .where('userid', userId)
            .first();
        if (!pet) {
            return res.status(404).render('pages/error', {
                title: 'Питомец не найден',
                message: 'Питомец не найден',
                error: { message: 'Питомец не найден или у вас нет прав для просмотра' }
            });
        }
        res.render('pages/client/pet-details', {
            title: `Питомец: ${pet.name}`,
            pet
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке информации о питомце: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке информации о питомце',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getEditPetForm = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        const pet = await db('pets')
            .where('petid', petId)
            .where('userid', userId)
            .first();
        if (!pet) {
            return res.status(404).render('pages/error', {
                title: 'Питомец не найден',
                message: 'Питомец не найден',
                error: { message: 'Питомец не найден или у вас нет прав для редактирования' }
            });
        }
        res.render('pages/client/edit-pet', {
            title: `Редактирование: ${pet.name}`,
            pet,
            formData: pet
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке формы редактирования питомца: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке формы редактирования питомца',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.updatePet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        const { name, type, breed, age, gender, medicalhistory } = req.body;
        const pet = await db('pets')
            .where('petid', petId)
            .where('userid', userId)
            .first();
        if (!pet) {
            return res.status(404).render('pages/error', {
                title: 'Питомец не найден',
                message: 'Питомец не найден',
                error: { message: 'Питомец не найден или у вас нет прав для редактирования' }
            });
        }
        if (!name || !type || !breed || !age || !gender) {
            return res.render('pages/client/edit-pet', {
                title: `Редактирование: ${pet.name}`,
                pet,
                formData: req.body,
                error: 'Заполните все обязательные поля'
            });
        }
        await db('pets')
            .where('petid', petId)
            .update({
                name,
                type,
                breed,
                age,
                gender,
                medicalhistory: medicalhistory || null
            });
        res.redirect(`/client/pets/${petId}?success=updated`);
    } catch (error) {
        logger.error(`Ошибка при обновлении данных питомца: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при обновлении данных питомца',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.deletePet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        const pet = await db('pets')
            .where('petid', petId)
            .where('userid', userId)
            .first();
        if (!pet) {
            return res.status(404).render('pages/error', {
                title: 'Питомец не найден',
                message: 'Питомец не найден',
                error: { message: 'Питомец не найден или у вас нет прав для удаления' }
            });
        }
        const hasAppointments = await db('appointments')
            .where('petid', petId)
            .whereIn('status', ['scheduled', 'accepted'])
            .first();
        if (hasAppointments) {
            return res.status(400).render('pages/error', {
                title: 'Удаление невозможно',
                message: 'Удаление питомца невозможно',
                error: { message: 'У питомца есть запланированные приемы. Отмените их перед удалением.' }
            });
        }
        await db('pets')
            .where('petid', petId)
            .delete();
        res.redirect('/client/pets?success=deleted');
    } catch (error) {
        logger.error(`Ошибка при удалении питомца: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при удалении питомца',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getPetHistory = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        const pet = await db('pets')
            .where('petid', petId)
            .where('userid', userId)
            .first();
        if (!pet) {
            return res.status(404).render('pages/error', {
                title: 'Питомец не найден',
                message: 'Питомец не найден',
                error: { message: 'Питомец не найден или у вас нет прав для просмотра' }
            });
        }
        const appointments = await db('appointments')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .select(
                'appointments.*',
                'vets.name as vet_name'
            )
            .where('appointments.petid', petId)
            .orderBy('appointments.date', 'desc');
        res.render('pages/client/pet-history', {
            title: `История: ${pet.name}`,
            pet,
            appointments
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке истории питомца: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке истории питомца',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getAppointments = async (req, res) => {
    try {
        const userId = req.user.userid;
        const status = req.query.status;
        let query = db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'vets.name as vet_name'
            )
            .where('pets.userid', userId);
        if (status) {
            query = query.where('appointments.status', status);
        }
        const appointments = await query.orderBy('appointments.date', 'desc');
        res.render('pages/client/appointments', {
            title: 'Мои приемы',
            appointments,
            status
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке списка приемов: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке списка приемов',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getAppointmentDetails = async (req, res) => {
    try {
        const userId = req.user.userid;
        const appointmentId = req.params.id;
        const appointment = await db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'pets.breed as pet_breed',
                'pets.type as pet_type',
                'vets.name as vet_name'
            )
            .where('appointments.appointmentid', appointmentId)
            .where('pets.userid', userId)
            .first();
        if (!appointment) {
            return res.status(404).render('pages/error', {
                title: 'Прием не найден',
                message: 'Прием не найден',
                error: { message: 'Прием не найден или у вас нет прав для просмотра' }
            });
        }
        res.render('pages/client/appointment-details', {
            title: `Прием #${appointmentId}`,
            appointment
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке информации о приеме: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке информации о приеме',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.userid;
        const appointmentId = req.params.id;
        const appointment = await db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .where('appointments.appointmentid', appointmentId)
            .where('pets.userid', userId)
            .first();
        if (!appointment) {
            return res.status(404).render('pages/error', {
                title: 'Прием не найден',
                message: 'Прием не найден',
                error: { message: 'Прием не найден или у вас нет прав для отмены' }
            });
        }
        if (appointment.status === 'completed') {
            return res.status(400).render('pages/error', {
                title: 'Невозможно отменить прием',
                message: 'Невозможно отменить завершенный прием',
                error: { message: 'Невозможно отменить завершенный прием' }
            });
        }
        await db('appointments')
            .where('appointmentid', appointmentId)
            .update({
                status: 'cancelled',
                updated_at: new Date()
            });
        res.redirect('/client/appointments');
    } catch (error) {
        logger.error(`Ошибка при отмене приема: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при отмене приема',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.getAppointmentForm = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { petid } = req.query;
        const pets = await db('pets').where('userid', userId);
        let selectedPet = null;
        if (petid) {
            selectedPet = pets.find(pet => pet.petid == petid) || null;
        }
        res.render('pages/client/appointment', {
            title: 'Запись на прием',
            pets,
            selectedPet,
            formData: req.body
        });
    } catch (error) {
        logger.error(`Ошибка при загрузке формы записи на прием: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке формы записи на прием',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
exports.createAppointment = async (req, res) => {
    try {
        const userId = req.user.userid;
        const {
            petid,
            addNewPet,
            petName,
            petType,
            petBreed,
            petAge,
            petGender,
            appointmentType,
            appointmentDate,
            vetid,
            time,
            notes
        } = req.body;
        let petId = petid;
        if (addNewPet === 'on') {
            if (!petName || !petType || !petAge || !petGender) {
                const pets = await db('pets').where('userid', userId);
                return res.render('pages/client/appointment', {
                    title: 'Запись на прием',
                    pets,
                    formData: req.body,
                    error: 'Заполните все обязательные поля для нового питомца'
                });
            }
            const [newPetId] = await db('pets').insert({
                userid: userId,
                name: petName,
                type: petType,
                breed: petBreed || 'Не указана',
                age: petAge,
                gender: petGender
            }, 'petid');
            petId = newPetId.petid;
        } else if (!petId) {
            const pets = await db('pets').where('userid', userId);
            return res.render('pages/client/appointment', {
                title: 'Запись на прием',
                pets,
                formData: req.body,
                error: 'Выберите питомца или добавьте нового'
            });
        }
        if (!appointmentType || !appointmentDate || !vetid || !time) {
            const pets = await db('pets').where('userid', userId);
            return res.render('pages/client/appointment', {
                title: 'Запись на прием',
                pets,
                formData: req.body,
                error: 'Заполните все обязательные поля для записи на прием'
            });
        }
        const existingAppointment = await db('appointments')
            .where('vetid', vetid)
            .where('date', appointmentDate)
            .where('time', time)
            .whereNot('status', 'cancelled')
            .first();
        if (existingAppointment) {
            const pets = await db('pets').where('userid', userId);
            return res.render('pages/client/appointment', {
                title: 'Запись на прием',
                pets,
                formData: req.body,
                error: 'Выбранное время уже занято. Пожалуйста, выберите другое время.'
            });
        }
        const [appointmentId] = await db('appointments').insert({
            petid: petId,
            vetid: vetid,
            date: appointmentDate,
            time: time,
            type: appointmentType,
            comment: notes || '',
            status: 'scheduled',
        }, 'appointmentid');
        res.redirect('/client/appointments?success=created');
    } catch (error) {
        logger.error(`Ошибка при создании приема: ${error}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при создании приема',
            error: process.env.NODE_ENV !== 'production' ? error : {}
        });
    }
};
