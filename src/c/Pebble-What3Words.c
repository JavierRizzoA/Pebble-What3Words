/*
   This file is part of Pebble-What3Words.

   Pebble-What3Words is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Pebble-What3Words is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Pebble-What3Words .  If not, see <http://www.gnu.org/licenses/>.
 */

#include <pebble.h>

static Window *window;
static TextLayer *word1_layer;
static TextLayer *word2_layer;
static TextLayer *word3_layer;
static GFont location_font;
static GFont time_font;
static BitmapLayer *background_layer;
static GBitmap *background_bitmap;
static TextLayer *time_layer;
static TextLayer *date_layer;

static void update_time() {
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);
  static char buffer[8];
  strftime(buffer, sizeof(buffer), clock_is_24h_style() ? "%H:%M" : "%I:%M",
      tick_time);
  text_layer_set_text(time_layer, buffer);
  static char date_buffer[8];
  strftime(date_buffer, sizeof(date_buffer), "%a %d", tick_time);
  for(unsigned int i = 0; i < strlen(date_buffer); i++)
    date_buffer[i] = date_buffer[i];
  text_layer_set_text(date_layer, date_buffer);
}


static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_time();
}

static void inbox_received_callback(DictionaryIterator *iter, void *context) {
  Tuple *word1_tuple = dict_find(iter, MESSAGE_KEY_Word1);
  Tuple *word2_tuple = dict_find(iter, MESSAGE_KEY_Word2);
  Tuple *word3_tuple = dict_find(iter, MESSAGE_KEY_Word3);
  if(word1_tuple && word2_tuple && word3_tuple) {
    char *word1 = word1_tuple->value->cstring;
    char *word2 = word2_tuple->value->cstring;
    char *word3 = word3_tuple->value->cstring;
    text_layer_set_text(word1_layer, word1);
    text_layer_set_text(word2_layer, word2);
    text_layer_set_text(word3_layer, word3);
  }
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  background_bitmap = gbitmap_create_with_resource(RESOURCE_ID_BG);
  background_layer = bitmap_layer_create(bounds);
  bitmap_layer_set_bitmap(background_layer, background_bitmap);
  layer_add_child(window_layer, bitmap_layer_get_layer(background_layer));

  location_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_HELVETICA_20));
  time_font = fonts_load_custom_font(resource_get_handle(RESOURCE_ID_FONT_HELVETICA_25));
  word1_layer = text_layer_create(GRect(44, 75, bounds.size.w - 44, 30));
  word2_layer = text_layer_create(GRect(44, 95, bounds.size.w - 44, 30));
  word3_layer = text_layer_create(GRect(44, 115, bounds.size.w - 44, 30));
  text_layer_set_font(word1_layer, location_font);
  text_layer_set_font(word2_layer, location_font);
  text_layer_set_font(word3_layer, location_font);
  text_layer_set_text(word1_layer, "...");
  text_layer_set_text(word2_layer, "...");
  text_layer_set_text(word3_layer, "...");
  text_layer_set_text_alignment(word1_layer, GTextAlignmentCenter);
  text_layer_set_text_alignment(word2_layer, GTextAlignmentCenter);
  text_layer_set_text_alignment(word3_layer, GTextAlignmentCenter);
  text_layer_set_background_color(word1_layer, GColorClear);
  text_layer_set_background_color(word2_layer, GColorClear);
  text_layer_set_background_color(word3_layer, GColorClear);
  text_layer_set_text_color(word1_layer, GColorSpringBud);
  text_layer_set_text_color(word2_layer, GColorVividCerulean);
  text_layer_set_text_color(word3_layer, GColorYellow);
  layer_add_child(window_layer, text_layer_get_layer(word1_layer));
  layer_add_child(window_layer, text_layer_get_layer(word2_layer));
  layer_add_child(window_layer, text_layer_get_layer(word3_layer));

  time_layer = text_layer_create(GRect(44, 35, bounds.size.w - 44, 32));
  date_layer = text_layer_create(GRect(44, 1, bounds.size.w - 44, 32));
  text_layer_set_background_color(time_layer, GColorClear);
  text_layer_set_background_color(date_layer, GColorClear);
  text_layer_set_text_color(time_layer, GColorWhite);
  text_layer_set_text_color(date_layer, GColorWhite);
  text_layer_set_text_alignment(time_layer, GTextAlignmentCenter);
  text_layer_set_text_alignment(date_layer, GTextAlignmentCenter);
  text_layer_set_font(time_layer, time_font);
  text_layer_set_font(date_layer, time_font);
  layer_add_child(window_layer, text_layer_get_layer(time_layer));
  layer_add_child(window_layer, text_layer_get_layer(date_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(word1_layer);
  text_layer_destroy(word2_layer);
  text_layer_destroy(word3_layer);
  fonts_unload_custom_font(location_font);
  fonts_unload_custom_font(time_font);
  gbitmap_destroy(background_bitmap);
  bitmap_layer_destroy(background_layer);
  text_layer_destroy(date_layer);
  text_layer_destroy(time_layer);
}

static void init(void) {
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_open(128, 128);
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
  update_time();
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
