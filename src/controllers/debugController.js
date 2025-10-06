import { User, Company, Offer, Application, Student } from '../models/relations.js';

async function debugUserCompanyMapping(req, res) {
    try {
        console.log('🔍 === DEBUG: MAPEO USUARIO-EMPRESA ===');
        
        // 1. Verificar usuarios empresa - 🔥 CORREGIR EL INCLUDE
        const companyUsers = await User.findAll({
            where: { role: 'company' },
            attributes: ['id', 'email', 'name', 'surname'],
            include: [{
                model: Company,
                as: 'companies', // 🔥 USAR EL ALIAS CORRECTO
                attributes: ['id', 'name', 'sector'],
                through: { attributes: [] } // 🔥 EXCLUIR CAMPOS DE LA TABLA INTERMEDIA
            }]
        });

        console.log('👥 Usuarios empresa:');
        companyUsers.forEach(user => {
            const companies = user.companies || [];
            const companyInfo = companies.length > 0 
                ? `${companies[0].name} (ID: ${companies[0].id})` 
                : 'NO COMPANY';
            console.log(`  - User ID: ${user.id}, Email: ${user.email}, Company: ${companyInfo}`);
        });

        // 2. Verificar ofertas
        const offers = await Offer.findAll({
            attributes: ['id', 'name', 'companyId'],
            include: [{
                model: Company,
                attributes: ['id', 'name', 'userId']
            }]
        });

        console.log('\n📋 Ofertas:');
        offers.forEach(offer => {
            console.log(`  - Offer ID: ${offer.id}, Name: ${offer.name}, Company ID: ${offer.companyId}, Company User ID: ${offer.Company?.userId || 'NO USER'}`);
        });

        // 3. Verificar aplicaciones CON MÁS DETALLES
        const applications = await Application.findAll({
            attributes: ['id', 'offerId', 'studentId', 'companyId', 'status', 'appliedAt'],
            include: [
                {
                    model: Offer,
                    attributes: ['id', 'name', 'companyId'],
                    include: [{
                        model: Company,
                        attributes: ['id', 'name', 'userId']
                    }]
                },
                {
                    model: Student,
                    attributes: ['id', 'userId'],
                    include: [{
                        model: User,
                        attributes: ['id', 'email', 'name']
                    }]
                }
            ]
        });

        console.log('\n📝 Aplicaciones DETALLADAS:');
        applications.forEach(app => {
            console.log(`  - App ID: ${app.id}`);
            console.log(`    Oferta: "${app.Offer?.name}" (ID: ${app.Offer?.id})`);
            console.log(`    Estudiante: ${app.Student?.User?.email} (UserID: ${app.Student?.User?.id})`);
            console.log(`    Company ID en App: ${app.companyId}`);
            console.log(`    Company ID en Offer: ${app.Offer?.companyId}`);
            console.log(`    Company User ID: ${app.Offer?.Company?.userId}`);
            console.log(`    Estado: ${app.status}`);
            console.log(`    Aplicado: ${app.appliedAt}`);
            console.log('    ---');
            console.log(`  - App ID: ${app.id}, OfferID: ${app.offerId}, StudentID: ${app.studentId}, Status: ${app.status}`);
    console.log(`    Oferta: "${app.offer?.name}" (CompanyID: ${app.offer?.companyId})`);
    console.log(`    Estudiante: ${app.student?.user?.email || 'N/A'}`);
    console.log(`    Fecha: ${app.appliedAt}`);
    console.log('    ---');
        });

        // 🔥 VERIFICAR USUARIO ACTUAL Y SU EMPRESA
        const currentUserId = req.user.userId;
        console.log(`\n🔍 Usuario actual: ${currentUserId}`);
        
        const currentUserCompany = await Company.findOne({
            where: { userId: currentUserId }
        });
        
        if (currentUserCompany) {
            console.log(`🏢 Empresa del usuario actual: ID ${currentUserCompany.id} - ${currentUserCompany.name}`);
            
            // 🔥 FILTRAR APLICACIONES POR COMPANY ID (no por userId)
            const userApplications = applications.filter(app => 
                app.companyId === currentUserCompany.id || app.Offer?.companyId === currentUserCompany.id
            );
            
            console.log(`📊 Aplicaciones para empresa ${currentUserCompany.id}: ${userApplications.length}`);
            userApplications.forEach(app => {
                console.log(`  ✅ ${app.Student?.User?.email} aplicó a "${app.Offer?.name}" (App ID: ${app.id})`);
            });

            res.json({
                currentUser: {
                    userId: req.user.userId,
                    companyId: userCompany?.Company?.id || null,
                    companyName: userCompany?.Company?.name || null
                },
                companyUsers: companyUsers.map(user => ({
                    userId: user.id,
                    email: user.email,
                    companies: user.companies || []
                })),
                offers: offers.map(o => ({
                    offerId: o.id,
                    offerName: o.name,
                    companyId: o.companyId,
                    companyUserId: o.Company?.userId
                })),
                applications: applications.map(a => ({
                    applicationId: a.id,
                    offerName: a.Offer?.name,
                    studentEmail: a.Student?.User?.email,
                    companyId: a.companyId,
                    companyIdFromOffer: a.Offer?.companyId,
                    companyUserId: a.Offer?.Company?.userId,
                    status: a.status,
                    appliedAt: a.appliedAt
                })),
                userApplicationsCount: userApplications.length,
                userApplicationsDetails: userApplications.map(app => ({
                    applicationId: app.id,
                    studentEmail: app.Student?.User?.email,
                    offerName: app.Offer?.name,
                    status: app.status
                }))
            });
        } else {
            console.log(`❌ No se encontró empresa para usuario ${currentUserId}`);
            res.status(403).json({ error: 'Usuario no asociado a empresa' });
        }

    } catch (error) {
        console.error('❌ Error en debug:', error);
        res.status(500).json({ error: error.message });
    }
}

export default { debugUserCompanyMapping };