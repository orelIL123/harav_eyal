import { db } from '../config/firebase'
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    updateDoc,
    query,
    orderBy,
    getDocs,
    writeBatch
} from 'firebase/firestore'
import { FAITH_TOPICS } from '../data/faithTopics'

const COLLECTION_NAME = 'faith_topics'

/**
 * Subscribe to faith topics updates
 * @param {function} onUpdate - callback with array of topics
 * @returns {function} unsubscribe function
 */
export const subscribeToFaithTopics = (onUpdate) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'))

    return onSnapshot(q, (snapshot) => {
        const topics = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        if (topics.length === 0) {
            // If collection is empty, trigger seeding automatically
            console.log('No faith topics found in Firestore, seeding now...')
            seedFaithTopics().then(() => {
                console.log('Seeding completed')
            }).catch(err => {
                console.error('Seeding failed:', err)
            })
        }

        onUpdate(topics)
    }, (error) => {
        console.error('Error listening to faith topics:', error)
        // Return empty array on error to prevent app crash
        onUpdate([])
    })
}

/**
 * Update a specific faith topic
 * @param {string} id - topic key/id
 * @param {object} updates - fields to update
 */
export const updateFaithTopic = async (id, updates) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id)
        await updateDoc(docRef, updates)
    } catch (error) {
        console.error('Error updating faith topic:', error)
        throw error
    }
}

/**
 * Seed initial data if collection is empty
 */
export const seedFaithTopics = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME))
        if (!querySnapshot.empty) {
            console.log('Faith topics already seeded')
            return
        }

        console.log('Seeding faith topics...')

        // Try to create documents one by one instead of batch
        // This might work better with security rules
        for (let index = 0; index < FAITH_TOPICS.length; index++) {
            const topic = FAITH_TOPICS[index]
            try {
                const docRef = doc(db, COLLECTION_NAME, topic.key)
                await setDoc(docRef, {
                    ...topic,
                    order: index,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                console.log(`Created topic: ${topic.title}`)
            } catch (err) {
                console.error(`Failed to create ${topic.title}:`, err.message)
            }
        }

        console.log('Seeding complete')
    } catch (error) {
        console.error('Error seeding faith topics:', error)
        throw error
    }
}
