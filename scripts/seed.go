package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
)

// SeedData populates Firestore with sample data
func main() {
	ctx := context.Background()

	projectID := os.Getenv("GCP_PROJECT_ID")
	if projectID == "" {
		log.Fatal("GCP_PROJECT_ID environment variable is required")
	}

	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer client.Close()

	fmt.Println("🌱 Seeding data...")

	// Create users
	users := []map[string]interface{}{
		{"id": "user1", "name": "山田太郎", "email": "yamada@example.com"},
		{"id": "user2", "name": "鈴木花子", "email": "suzuki@example.com"},
		{"id": "user3", "name": "佐藤次郎", "email": "sato@example.com"},
	}

	for _, u := range users {
		_, err := client.Collection("users").Doc(u["id"].(string)).Set(ctx, u)
		if err != nil {
			log.Printf("Failed to create user %s: %v", u["id"], err)
		} else {
			fmt.Printf("✅ Created user: %s\n", u["name"])
		}
	}

	// Create announcements
	announcements := []map[string]interface{}{
		{
			"title":         "🎉 新歓パーティー開催！",
			"body":          "4月10日に新入生歓迎パーティーを開催します！\n\n【日時】4月10日（水）18:00〜21:00\n【場所】大学近くのカフェ「Circle Cafe」\n【参加費】1,500円（飲み物・軽食代込み）\n\n新入生の皆さんと在校生の交流を深める楽しいイベントです。\nゲームやクイズ大会も予定しています。\n\nみんなで楽しく過ごしましょう！🎊",
			"imageUrl":      "",
			"targetUserIds": []string{"user1", "user2", "user3"},
			"createdAt":     time.Now().Add(-72 * time.Hour),
		},
		{
			"title":         "📚 勉強会のお知らせ",
			"body":          "今月の勉強会のお知らせです！\n\n【日時】4月15日（月）19:00〜21:00\n【場所】大学図書館 グループ学習室A\n【テーマ】最新のWeb技術入門\n\n今回はReactとNext.jsについて学びます。\n初心者の方も大歓迎！基礎から丁寧に説明します。\n\nノートPCを持参してください。",
			"imageUrl":      "",
			"targetUserIds": []string{"user1", "user2"},
			"createdAt":     time.Now().Add(-48 * time.Hour),
		},
		{
			"title":         "🏃 春のハイキング企画",
			"body":          "春のハイキングを企画しました！\n\n【日時】4月20日（土）9:00〜17:00\n【集合】大学正門前 9:00集合\n【行き先】高尾山（初心者コース）\n【持ち物】\n- お弁当・飲み物\n- 動きやすい服装\n- 雨具\n\n参加費は交通費のみ実費負担です。\n天候により中止の場合は前日までに連絡します。",
			"imageUrl":      "",
			"targetUserIds": []string{"user1", "user3"},
			"createdAt":     time.Now().Add(-24 * time.Hour),
		},
	}

	announcementIDs := make([]string, 0)
	for _, a := range announcements {
		docRef, _, err := client.Collection("announcements").Add(ctx, a)
		if err != nil {
			log.Printf("Failed to create announcement: %v", err)
		} else {
			announcementIDs = append(announcementIDs, docRef.ID)
			fmt.Printf("✅ Created announcement: %s\n", a["title"])
		}
	}

	// Create payments for first announcement
	if len(announcementIDs) > 0 {
		payments := []map[string]interface{}{
			{
				"announcementId": announcementIDs[0],
				"userId":         "user1",
				"amount":         1500,
				"isPaid":         false,
				"description":    "新歓パーティー参加費",
				"bankInfo":       "三菱UFJ銀行 渋谷支店\n普通 1234567\nサークル カイケイ",
				"paypayInfo":     "circle_accounting",
			},
			{
				"announcementId": announcementIDs[0],
				"userId":         "user2",
				"amount":         1500,
				"isPaid":         true,
				"description":    "新歓パーティー参加費",
				"bankInfo":       "三菱UFJ銀行 渋谷支店\n普通 1234567\nサークル カイケイ",
				"paypayInfo":     "circle_accounting",
			},
			{
				"announcementId": announcementIDs[0],
				"userId":         "user3",
				"amount":         1500,
				"isPaid":         false,
				"description":    "新歓パーティー参加費",
				"bankInfo":       "三菱UFJ銀行 渋谷支店\n普通 1234567\nサークル カイケイ",
				"paypayInfo":     "circle_accounting",
			},
		}

		for _, p := range payments {
			_, _, err := client.Collection("payments").Add(ctx, p)
			if err != nil {
				log.Printf("Failed to create payment: %v", err)
			} else {
				fmt.Printf("✅ Created payment for: %s\n", p["userId"])
			}
		}
	}

	fmt.Println("\n🎉 Seeding complete!")
}
