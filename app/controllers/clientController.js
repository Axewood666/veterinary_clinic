/**
 * Контроллер для клиентских функций
 * Обрабатывает запросы для личного кабинета клиента,
 * управления питомцами и записями на прием
 */

const db = require('../config/database')
const logger = require('../utils/logger');

/**
 * Отображает страницу личного кабинета клиента
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.userid;
        
        // Получение питомцев клиента
        const pets = await db('pets').where('userid', userId);
        
        // Получение ближайших приемов
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
            
        // Получение последних завершенных приемов
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

/**
 * Отображает профиль клиента для просмотра и редактирования
 */
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

/**
 * Обновляет данные профиля клиента
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { name, email, phoneNumber } = req.body;
        
        // Базовая валидация
        if (!name || !email || !phoneNumber) {
            return res.render('pages/client/profile', {
                title: 'Мой профиль',
                user: req.body,
                error: 'Все поля должны быть заполнены'
            });
        }
        
        // Обновление данных пользователя
        await db('users')
            .where('userid', userId)
            .update({
                name,
                email,
                phoneNumber
            });
        
        // Перенаправление на страницу профиля с сообщением об успехе
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

/**
 * Отображает список всех питомцев клиента
 */
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

/**
 * Отображает форму для добавления нового питомца
 */
exports.getAddPetForm = (req, res) => {
    res.render('pages/client/add-pet', {
        title: 'Добавление питомца',
        formData: {}
    });
};

/**
 * Добавляет нового питомца в базу данных
 */
exports.addPet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { name, type, breed, age, gender, medicalhistory } = req.body;
        
        // Базовая валидация
        if (!name || !type || !breed || !age || !gender) {
            return res.render('pages/client/add-pet', {
                title: 'Добавление питомца',
                formData: req.body,
                error: 'Заполните все обязательные поля'
            });
        }
        
        // Добавление питомца
        await db('pets').insert({
            userid: userId,
            name,
            type,
            breed,
            age,
            gender,
            medicalhistory: medicalhistory || null
        });
        
        // Перенаправление на список питомцев с сообщением об успехе
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

/**
 * Отображает подробную информацию о питомце
 */
exports.getPet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        
        // Получение данных о питомце
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

/**
 * Отображает форму редактирования питомца
 */
exports.getEditPetForm = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        
        // Получение данных о питомце
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

/**
 * Обновляет данные питомца
 */
exports.updatePet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        const { name, type, breed, age, gender, medicalhistory } = req.body;
        
        // Проверка существования питомца и прав доступа
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
        
        // Базовая валидация
        if (!name || !type || !breed || !age || !gender) {
            return res.render('pages/client/edit-pet', {
                title: `Редактирование: ${pet.name}`,
                pet,
                formData: req.body,
                error: 'Заполните все обязательные поля'
            });
        }
        
        // Обновление данных питомца
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
        
        // Перенаправление на страницу питомца с сообщением об успехе
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

/**
 * Удаляет питомца
 */
exports.deletePet = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        
        // Проверка существования питомца и прав доступа
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
        
        // Проверка наличия связанных приемов
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
        
        // Удаление питомца
        await db('pets')
            .where('petid', petId)
            .delete();
        
        // Перенаправление на список питомцев с сообщением об успехе
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

/**
 * Отображает историю питомца
 */
exports.getPetHistory = async (req, res) => {
    try {
        const userId = req.user.userid;
        const petId = req.params.id;
        
        // Получение данных о питомце
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
        
        // Получение истории приемов
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

/**
 * Отображает список приемов клиента
 */
exports.getAppointments = async (req, res) => {
    try {
        const userId = req.user.userid;
        const status = req.query.status;
        
        // Базовый запрос
        let query = db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'vets.name as vet_name'
            )
            .where('pets.userid', userId);
        
        // Фильтр по статусу, если указан
        if (status) {
            query = query.where('appointments.status', status);
        }
        
        // Получение приемов
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

/**
 * Отображает подробную информацию о приеме
 */
exports.getAppointmentDetails = async (req, res) => {
    try {
        const userId = req.user.userid;
        const appointmentId = req.params.id;
        
        // Получение данных о приеме
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

/**
 * Отменяет прием
 */
exports.cancelAppointment = async (req, res) => {
    try {
        const userId = req.user.userid;
        const appointmentId = req.params.id;
        
        // Проверка существования приема и прав доступа
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
        
        // Проверка возможности отмены приема
        if (appointment.status === 'completed') {
            return res.status(400).render('pages/error', {
                title: 'Невозможно отменить прием',
                message: 'Невозможно отменить завершенный прием',
                error: { message: 'Невозможно отменить завершенный прием' }
            });
        }
        
        // Отмена приема
        await db('appointments')
            .where('appointmentid', appointmentId)
            .update({
                status: 'cancelled',
                updated_at: new Date()
            });
        
        // Перенаправление на страницу с приемами
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

/**
 * Отображает форму записи на прием
 */
exports.getAppointmentForm = async (req, res) => {
    try {
        const userId = req.user.userid;
        const { petid } = req.query;
        
        // Получение списка питомцев клиента
        const pets = await db('pets').where('userid', userId);
        
        // Указанный питомец (if provided)
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

/**
 * Создает новую запись на прием
 */
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
        
        // Если выбрано создание нового питомца
        if (addNewPet === 'on') {
            // Валидация данных нового питомца
            if (!petName || !petType || !petAge || !petGender) {
                const pets = await db('pets').where('userid', userId);
                return res.render('pages/client/appointment', {
                    title: 'Запись на прием',
                    pets,
                    formData: req.body,
                    error: 'Заполните все обязательные поля для нового питомца'
                });
            }
            
            // Создание нового питомца
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
            // Если не выбран существующий питомец и не создан новый
            const pets = await db('pets').where('userid', userId);
            return res.render('pages/client/appointment', {
                title: 'Запись на прием',
                pets,
                formData: req.body,
                error: 'Выберите питомца или добавьте нового'
            });
        }
        
        // Валидация данных приема
        if (!appointmentType || !appointmentDate || !vetid || !time) {
            const pets = await db('pets').where('userid', userId);
            return res.render('pages/client/appointment', {
                title: 'Запись на прием',
                pets,
                formData: req.body,
                error: 'Заполните все обязательные поля для записи на прием'
            });
        }
        
        // Проверка доступности выбранного времени
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
        
        // Создание нового приема
        const [appointmentId] = await db('appointments').insert({
            petid: petId,
            vetid: vetid,
            date: appointmentDate,
            time: time,
            type: appointmentType,
            comment: notes || '',
            status: 'scheduled',
        }, 'appointmentid');
        
        // Перенаправление на страницу с приемами
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
